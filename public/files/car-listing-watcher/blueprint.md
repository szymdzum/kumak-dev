# Blueprint: classifieds watcher with push notifications

A spec for an AI coding agent. Read it, adjust the **Your setup** section, and hand the whole file to the agent with "implement this". It describes the system I run for used cars on OLX and Otomoto (Poland), but the shape works for any classifieds site: flats, bikes, camera gear.

Endpoints and field names below were correct in November 2026. They're unofficial and will drift. The agent should verify each one against a live response before relying on it.

---

## Your setup (fill in before handing over)

| Question | Example |
|---|---|
| What are you looking for? | Suzuki Vitara, 2019+, ≤100k km, ≤65k PLN, not silver, not damaged |
| Which sites? | OLX, Otomoto |
| Where does it run? | Raspberry Pi with Docker, always on |
| How do pushes reach you? | Home Assistant mobile app (alternatives: ntfy, Telegram bot, Pushover) |
| Who gets pushes? | Two phones, each signs its own ⭐/👎 |
| Hours | Every 30 min, 07:00–22:00 |

---

## Goal

Be the first serious buyer to call, and only get pinged for listings worth calling about.

Concretely:
1. Every listing matching the search reaches the phone within one check interval of being posted.
2. Listings that fail the hard criteria (including damage only mentioned in the description) never reach the phone.
3. One car posted several times, or on several sites, produces one push.
4. Each push carries enough context to decide in ten seconds: specs, location, seller type, red flags, price versus similar cars.

Non-goals: buying automation, contacting sellers, scraping photos, a public website.

---

## Architecture

```
sites ──fetch──▶ normalise ──▶ filter ──▶ dedupe ──▶ SQLite ──▶ push (new / price drop / gone)
                                                       │
                                                       └──▶ dashboard state ◀── ⭐/👎 from phone or dashboard
```

- **One long-running process** in a container: a scheduler loop plus a tiny HTTP server on `127.0.0.1` for decisions coming back from the phone.
- **Python 3.13**, one dependency: `curl_cffi`. Standard library for everything else (sqlite3, http.server, tomllib, urllib).
- **Config in TOML**, re-read before every check, so edits need no restart.
- **Code mounted read-only** into the container: code changes need a restart, not a rebuild.
- **~1,250 lines total** is a realistic size. If it grows much past that, something is over-engineered.

Suggested modules: `sources.py` (fetch and normalise per site), `store.py` (SQLite), `notify.py` (push text and sending), `report.py` (market median, merging copies, weekly digest), `dashboard.py` (state for the UI), `server.py` (HTTP), `schedule.py`, `__main__.py` (CLI and check loop).

---

## Data model

Normalise every site into one record:

```python
@dataclass
class Listing:
    source: str            # "olx" | "otomoto"
    id: str
    url: str
    title: str
    price: int
    year: int | None
    mileage: int | None
    engine_cc: int | None
    power_hp: int | None
    gearbox: str           # normalise labels across sites
    color: str
    damaged: bool | None   # None = unknown
    private: bool | None
    city: str
    region: str
    created: str           # ISO, as the site gives it
    thumb: str             # 320×240 photo URL from search results
    flags: list[str]       # 🚩 display labels
    pluses: list[str]      # ✅ display labels
    no_vin: bool
    fresh_account: bool
    enriched: bool         # detail-page fields filled

    key = f"{source}:{id}"           # how the UI and push buttons refer to it
    scam_risk = no_vin and fresh_account
```

SQLite, autocommit (`isolation_level=None`) so the scheduler never holds a write lock while fetching and a ⭐ from the HTTP thread only waits for one statement:

```sql
CREATE TABLE listings (
  source TEXT, id TEXT, search TEXT,
  fingerprint TEXT,                -- year|city, for cross-site matching
  url TEXT, title TEXT, price INTEGER,
  status TEXT,                     -- notified | baseline | duplicate | filtered
  reason TEXT,                     -- why filtered, human-readable
  first_seen TEXT, last_seen TEXT,
  data TEXT,                       -- the Listing as JSON
  first_price INTEGER,             -- for "was X" in the UI
  gone_at TEXT,                    -- dropped out of results; cleared if it comes back
  decision TEXT, decided_by TEXT, decided_at TEXT,   -- star | no | NULL
  PRIMARY KEY (source, id)
);
CREATE TABLE searches (name TEXT PRIMARY KEY, baseline_at TEXT, checked_at TEXT);
CREATE TABLE alerts   (key TEXT PRIMARY KEY, sent_at TEXT);   -- throttle error pushes
CREATE TABLE checks   (search TEXT, at TEXT);                 -- activity, keep 7 days
```

Keep **every** listing ever seen, including filtered ones with their reason. That table is your debugging tool and your market data.

---

## Sources

### Fetching (all sites)

- Use `curl_cffi` with `impersonate="chrome"` and `Accept-Language: pl-PL`. OLX sits behind CloudFront WAF, which returns 403 to anything without a browser TLS fingerprint. Plain `requests`/`curl` will not work.
- Sleep 1.5 s between requests. With a 30-minute interval that's a few dozen requests per hour, which is human scale. Don't go lower.
- Sort by newest first, and stop paginating at a cap (OLX offset 200, Otomoto 5 pages). Mark the result `complete=False` if the cap was hit before the end: such a result can't be used to decide something was sold.

### OLX: public JSON API

```
GET https://www.olx.pl/api/v1/offers/
  ?category_id=84                       # cars
  &query=<make> <model>
  &limit=40&offset=<n>
  &sort_by=created_at:desc
  &filter_float_year:from=<year>
  &filter_float_price:to=<cap>
  &filter_float_milage:to=<km>          # sic: "milage"
```

- `data[]` is the listings and `metadata.total_elements` the total.
- Each ad has `params[]` as `{key, value}`. Interesting keys: `model`, `price`, `year`, `milage`, `enginesize`, `enginepower`, `transmission`, `color`, `condition` ("Uszkodzony"), `country_origin`, `righthanddrive`, `vin`.
- `query` is full-text, so **filter on `params.model.label` exactly**. Otherwise "Vitara" also returns Grand Vitara.
- **Deduplicate ids within one fetch.** A new ad posted mid-pagination shifts pages and you see the same ad twice.
- `user.created` gives the seller account age. Ads exported from Otomoto to OLX all share one old account named "Otomoto", so skip the account check for those.
- The single-offer endpoint (`/api/v1/offers/<id>`) often returns 403 even with impersonation. Everything you need is already in the search results, including the description.

### Otomoto: Next.js page state

```
GET https://www.otomoto.pl/osobowe/<make>/<model>/od-<year>
  ?search[order]=created_at_first:desc
  &search[filter_float_price:to]=<cap>
  &search[filter_float_mileage:to]=<km>
  &page=<n>
```

- Parse `<script id="__NEXT_DATA__">`, then `props.pageProps.urqlState`. Find the value whose `data` (a JSON string or an object) contains `advertSearch`. That object holds `edges[].node` and `totalCount`.
- A node has `id`, `url`, `title`, `price.amount.units`, `parameters[]` (`year`, `mileage`, `engine_capacity`, `engine_power`, `gearbox`), `location`, `createdAt`, `thumbnail.x1`.
- **Search results lack colour, damage, seller type and history.** For each *new* listing, fetch its detail page once (the "enrich" step): `__NEXT_DATA__` → `props.pageProps.advert`. Then read:
  - `parametersDict.<key>.values[0].value`: `color`, `damaged`, `is_imported_car`, `country_origin`, `registered`, `rhd`, `no_accident`, `original_owner`, `service_record`, `has_vin`,
  - `seller.type` ("PRIVATE" / business),
  - `seller.featuresBadges[code=registration-date]`, which says only the year the seller joined,
  - `originalCreatedAt`, because `createdAt` resets when the ad is re-listed,
  - `description` (HTML), `isParts`.
- Store the enriched fields and copy them from the DB on later checks. Never refetch detail pages for known listings.
- If `__NEXT_DATA__` or `advertSearch` is missing, raise a distinct `LayoutChanged` error. That means the parser needs fixing or you're blocked, which is different from a timeout.

---

## Filtering

Hard criteria, checked in order, each returning a human-readable reason that gets stored:

1. year < `year_from`
2. price > `price_to × (1 + price_stretch)`. Fetch up to +8 % above budget: those come through as "near-miss" pushes, because sellers often negotiate down to it.
3. price < `price_from`. Below a sane floor it's bait, a lease instalment, or parts.
4. mileage > `mileage_to`
5. colour in `exclude_colors`
6. `damaged` and `skip_damaged`

**Re-check known listings every run.** A listing that passed yesterday can fail today: the seller raised the price, added "damaged" to the description, or you tightened the criteria. Move it to `filtered`. A filtered listing whose price dropped into range comes back as a price-drop push.

### Damage in the description

The most valuable filter. Over three weeks, 67 of 251 matching listings were damaged, and many said so only in the text, three paragraphs down.

- Strip HTML, lowercase, then match patterns. Keep two lists:
  - **damage**, which rejects: "uszkodzony przód/tył/bok", "lekko/mocno uszkodzony", "auto jest uszkodzone", "pali i jeździ (po placu)", "uszkodzenia (widoczne) na zdjęciach";
  - **flags**, which only warn: "cesja / leasing do przejęcia", "do naprawy / na części / nie odpala", "po wypadku / po szkodzie / zalany", "anglik / kierownica po prawej".
- **Negation:** ignore a match if the 30 characters before it contain `nie|nic|bez|żadn…` within the same sentence. Without this, "nie był po szkodzie" and "bez wypadku" trip the filter.
- **Word boundaries matter.** `cesj` without `\b` matches "koncesjonowany". Dealers write "nie sprzedajemy aut uszkodzonych", so keep damage patterns narrow (noun plus location) rather than matching every "uszkodz".
- Keep a test file of real description snippets that must match and that must not. Add one every time something slips through.

---

## Red flags and context

Shown in the push, not used to reject:

- imported (country), unregistered in Poland, right-hand drive, "not accident-free"
- **no VIN**
- **fresh seller account**: younger than 60 days, or created less than 2 days before the ad. On Otomoto only the join year is known, so treat "joined this year" as fresh.
- **scam risk = no VIN AND fresh account.** Either alone is common: 40 of 41 OLX listings had no VIN. Together they're the classic OLX scam pattern.
- worth adding: a "private" seller whose description says "faktura VAT marża" is a dealer pretending.

Pluses (✅): accident-free, first owner, service history, plus one or two features you care about.

### Price versus market

`📊 −2 000 zł vs median of 7 similar (2019, ±20k km)`

- Peers: same search, **same year**, mileage within ±20,000 km, not damaged, seen in the last 60 days, above `price_from`, not the listing itself.
- Fewer than 3 peers: no line at all. A median of two is noise.
- **Also match engine power (±15 hp)** if the model comes with several engines. Otherwise a 1.4 compared with 1.0s looks 10k overpriced, which happened to me with the car I eventually bought.

---

## Deduplication

The same car shows up as several listings: one dealer posting it twice in two cities, Otomoto auto-exporting to OLX, a private seller posting on both sites.

- **Fingerprint** = `year|city` (lowercased).
- **Same car, other site:** same fingerprint, different source, mileage within 2,000 km (sellers round the odometer differently), and already `notified` or `baseline`. Store the new one as `duplicate`.
- **Same ad twice on one site:** same year, exact mileage and exact price as a live notified listing. This catches dealer chains that post the same car in several cities.
- Two cars of one dealer in one city with different mileage are **not** duplicates.
- **Merge before pushing and displaying.** Group copies, pick the Otomoto copy as primary (it has more detail), and union flags and pluses. A VIN on either copy counts as a VIN; damage or a fresh account on either copy counts. This matters because an OLX copy exported from Otomoto shows only the shared export account, and the real seller's fresh account is visible only on Otomoto.

---

## Lifecycle and pushes

| Event | Push |
|---|---|
| First run of a new search | Silent **baseline**: store everything that passes, then one push "watching N listings". Otherwise day one is 40 pushes. |
| New listing passes | 🚗 `Vitara 2019 · 64 900 zł`, plus specs, location and seller line, 🚩 line, ✅ line, 📊 line |
| New listing over budget but within stretch | 🤏 same, `(+2 900 zł over budget)` |
| Price drop on a passing, not-rejected listing | 📉 `66 900 → 64 900 zł` (⭐ first if starred) |
| Passing listing disappears from **both** sites in a complete fetch | 💨 `gone after N days · M left in budget` (⭐ if starred) |
| Source or parser broken | ⚠️ to the first phone only, at most once per 24 h per source |
| Sunday evening | 📊 weekly digest: new listings, drops, sold, median |

Rules:
- **Gone requires a complete, non-empty fetch.** An empty result is more likely a hiccup than everything selling at once.
- In-budget listings come before near-misses. Push at most 5 per run, then one "+N more" summary.
- Push text is built from the **merged** record (see Deduplication).
- Every push for a listing carries a **tag** (`cardar-<source>-<id>`). A later push about the same car replaces it, and rating it clears it from every phone.
- Tapping the push opens the listing URL.

### Ratings: ⭐ / 👎

- Push actions: `⭐ Interesting` and `👎 Not for us`. Encode the action id as `APP|<decision>|<source:id>|<person>`, so the handler knows who pressed it without separate users.
- **One 👎 from anyone hides the car for everyone** and stops its price-drop and gone pushes.
- ⭐ sorts the car to the top and puts ⭐ on its later pushes.
- Decision endpoint: `POST /decide {"key": "otomoto:123", "decision": "star"|"no"|"none", "by": "Alex"}`, where `"none"` takes it back. Bind to `127.0.0.1`, return 204, and return 400 on an unknown key. After saving: republish the dashboard and clear the push from all phones. Log failures after the save instead of returning them, because the decision is already done.

---

## Home Assistant integration (if you use HA)

- **Pushes:** `POST /api/services/notify/mobile_app_<phone>` with `{title, message, data: {url, clickAction, tag, group, actions: [...]}}`. To clear: `message: "clear_notification", data: {tag}`. Send one call per phone so each phone's actions are signed with its owner's name.
- **Button presses** arrive as `mobile_app_notification_action` events. An automation that matches `action` starting with `APP|` splits it and calls a `rest_command` that POSTs to `/decide`.
- **Dashboard state:** `POST /api/states/sensor.<app>_<search>` with a small state (count in budget) and the whole list as attributes: per car key, url, thumb, price, was, year, km, city, site, days listed, delta vs market, over budget, flags, pluses, scam, new, decision, by, decided_at. Plus the criteria, last and next check, gone cars, and a 24-hour activity summary.
- **States set through the API are not persisted.** Add an automation on HA start that waits 15 s and calls `POST /publish` on the watcher.
- Add the sensor to recorder `exclude`, since big attributes bloat the database.
- The token lives in a file mounted read-only into the container, never in the repo.

Without HA, ntfy and Telegram both support action buttons and URLs. Replace the event automation with a webhook or a polling bot.

---

## Dashboard (optional, but it's what makes it a shared tool)

One custom card, three tabs (two columns on wide screens):
- **To review:** passing cars without a decision, newest first, each with thumb, price, delta vs market, year, km, city, site, age, flag chips, and ⭐/👎 buttons.
- **Interesting:** starred, most recently starred first.
- **Rejected:** with a "restore" button.

Plus:
- **Header tiles:** number in budget, market median, last check time (green dot when the last check succeeded and is recent) with "N checks · M new in 24 h".
- A **price drop banner**.
- **"Gone in the last 14 days"** with days listed: your best evidence for how fast good cars sell.
- **Last 24 h:** every new listing and why it was filtered. This answers "is it broken or is the market quiet?"
- **Optimistic UI** for buttons: mark immediately, roll back if the call fails.

---

## Schedule and resilience

- Checks run every `interval_min` within `active_hours`, aligned to the clock (07:00, 07:30, …). There's no point checking at 3 am, because nobody calls a seller then.
- Run immediately on start if a search has no baseline yet.
- An exception in a check must not kill the loop. Log it and push ⚠️ once per 24 h (throttled in memory, because the DB may be what's broken).
- If a detail page fails with a 404 or timeout, skip it without storing, so it's retried next run. Alert only on `LayoutChanged`.
- CLI: `run` (default), `check --dry-run` (print pushes, work on an in-memory DB copy), `check --quiet` (save without pushing, for use after widening criteria), `digest`, `test-notify`.

---

## Config example

```toml
interval_min = 30
active_hours = ["07:00", "22:00"]
max_pushes_per_run = 5

[notify]               # person → push target; first one also gets ⚠️ alerts
Alex = "notify.mobile_app_alex_phone"
Sam  = "notify.mobile_app_sam_phone"

[[searches]]
name = "vitara"
label = "Vitara"
make = "suzuki"
model = "Vitara"       # exact model label
year_from = 2019
price_from = 15000
price_to = 65000
price_stretch = 0.08
mileage_to = 100000
exclude_colors = ["Srebrny"]   # labels as the sites show them
skip_damaged = true
# sources = ["olx", "otomoto"]
```

---

## Acceptance checks for the agent

Before calling it done, the agent should show:

1. **Coverage:** a `--dry-run` check, and an independent fetch of both sites (plain search, no filters) compared against the DB. Zero matching listings missing.
2. **Filter reasons:** a table of `status, reason, count` from the DB that looks plausible. For damage, show 5 rejected descriptions and 5 accepted ones.
3. **Negation tests:** "nie był po szkodzie", "bez wypadku", "koncesjonowany", "nie sprzedajemy aut uszkodzonych" don't trigger. "uszkodzony przód", "pali i jeździ po placu", "po kolizji" do.
4. **Dedup:** the same car on both sites gives one push, with flags from both copies.
5. **Round trip:** ⭐ pressed on phone A → DB updated with A's name → dashboard updated → push cleared on phone B.
6. **Restart:** restarting HA brings the dashboard back within a minute, and restarting the watcher produces no duplicate pushes.

---

## Lessons from running it

- **Diagnose before tuning.** When nothing arrived for four days, it looked broken. An independent fetch showed zero missed listings: in-budget cars were just rare. That's what justified raising the budget, not a hunch.
- **Every false negative is a new test case.** The damage regexes are 80 % lessons from specific listings.
- **Speed is real.** The push for the car we bought came at 16:30, I called at 16:35, and we were first. The seller had three more calls by 10:00 the next morning, and the listing was gone 21 hours after the push.
- **Gone tracking is your market research.** "Sold after 2 days at 59.9k" tells you more about fair price than any asking-price median.

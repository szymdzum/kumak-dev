# Yard camera: running notes for a blog post

Raw material, appended as things happen. Not a draft. Facts, numbers, failures, fixes.
Source of truth for the current design: Raspi `~/services/CLAUDE.md` → "Yard camera (Podwórko)".

## The setup (as of 2026-10-09)

- Camera: Tapo C325WB (~2K, Wi-Fi, floodlight, siren), bought Oct 2026. Picked over Reolink RLC-811WA
  (670 zł, reviews about blurry image from low Wi-Fi bitrate).
- Mounted under the porch roof, looking down a ~30–40 m driveway to the gate. Re-aimed so the street beyond
  the gate is out of frame (privacy / legal worry at home), no privacy masks needed.
- Brain: Home Assistant in Docker on a Raspberry Pi 5 ("kumak"). Everything built with Claude Code over SSH.
- Pipeline: camera → go2rtc (only video client) → HA. ONVIF for events (person / vehicle / line crossing),
  tapo_control for floodlight / siren / privacy. On a detection: 2K snapshot + two 720p frames →
  Gemini (structured output: category, is-new, description, known car) with the last 8 timeline events
  as context → push to both phones only if it matters → timeline on a dashboard.
- Known car "Cham": nickname of a person who visits; his dark navy Volvo S60 is matched against a reference
  crop. Visits tracked by a periodic frame check, stats on the dashboard ("Monitoring Chama").
  Prompt gotcha: the model wrote "someone got out of Cham" → had to explain Cham is the driver, not the car.
- Health monitoring + self-heal: ping/MAC/go2rtc probe every 60 s, HA log errors translated to Polish pushes,
  auto camera reboot on no image, ONVIF reload on stuck sensors, host cron watchdog restarting go2rtc / HA.

## War stories

### The stalls were the Wi-Fi extender, not Home Assistant (2026-10-07)
- Symptom: live view freezing, RTSP errors, everything looked like an HA/go2rtc problem.
- Pi → router 0% loss; Pi → camera 22–44% loss, 1–10 s ping, even with go2rtc stopped.
- Tell: the ARP table showed the camera with MAC `5a:ea:…` instead of its real one → MAC-NAT of a
  Xiaomi range extender. The camera preferred the extender (same SSID) over the router.
- Unplug extender → camera on the router at RSSI -69 → 0% loss, ~2.5 ms. Fix: renamed the extender's
  SSID so the camera can't latch onto it. Health probe now alerts if the MAC changes again.

### The camera allows only a few RTSP sessions
- Every integration wanted its own stream (ONVIF camera entity, Tapo Control's HD/SD entities polling every 30 s,
  HA snapshots, the Tapo app). Result: "Operation not permitted" and choked Wi-Fi.
- One 2K stream continuously = 30% loss, 2.5 s ping on the camera's Wi-Fi even at RSSI -38.
- Fix: go2rtc as the ONLY client. Two streams: 2K for short grabs only, 720p (~1 Mb/s) for live view and AI frames.
  All other camera entities disabled on purpose.

### camera.snapshot gives grey smeared frames
- ffmpeg starts mid-GOP (from a P-frame) → grey smeared bands. Fix: grab `frame.jpeg` from go2rtc's API (0.25 s).
- Also: a failed grab leaves the OLD file in place → the AI would describe a past event. Always check returncode.

### The leaf storm (night of 2026-10-09)
- Added the camera's own line-crossing at the gate as a "priority" trigger.
- At night, IR-lit vine leaves crossed the line ~170×/h → ~540 Gemini calls, ~9 zł in one night
  (worst day ~13 zł vs a normal ~1 zł). Saving the line in the Tapo app had silently reset the target filter
  (person/vehicle/bike) to off.
- Fixes: script re-asserting the filter + day/night sensitivity, storm guard (>4 crossings / 10 min = noise),
  correlation (line without a person/vehicle detection = skip), daily AI cap, GCP quota 6 req/min, GCP budget.

### A cat is a vehicle (2026-10-09 afternoon)
- Tapo's "vehicle" detection fired 40–58×/h on a cat, shadows and the parked car. Vehicles were deliberately
  never throttled ("never miss a car") → the daily AI cap (120/200) was gone by 16:50.
- Worse: the cap gave vehicles priority (200) over the gate (120), so real arrivals/departures that evening
  got "no AI description" pushes. Priorities inverted by accident.
- Fix: 10 min vehicle cooldown after an unimportant verdict; a gate crossing lifts it.
- Animals removed from the timeline entirely: the user simply doesn't care about cats.

### The gate line: from trigger to hint (2026-10-09 evening)
- As a trigger with forced importance + an instant "someone at the gate" push (sent before the AI verdict),
  it pushed cats and household members pottering near the porch. Today: 220 line-triggered runs,
  4 real gate events, 8 noise pushes.
- Key observation: correlation already required a person/vehicle detection, so the line added nothing as a
  trigger. Its real value is direction (entering vs leaving) and lifting cooldowns.
- Now: line crossing = a hint for the next detection ("this happened at the gate") + cooldown reset.
  Push decided only by the model's verdict. One push, ~30 s late, with a description. User prefers fewer
  pushes over faster ones.

### HA upgrade silently killed the whole alert pipeline (2026-10-09)
- HA 2025.11 → 2026.10 (needed for native Tapo line-crossing mapping; Docker 20.10 → 29.9 along the way).
- ONVIF changed unique_ids → new entities with `_2` suffix; every automation, history_stats, health check and
  dashboard listened to the old frozen ones. AI counter sat at 0, a car at 12:35 went unnoticed.
- Found by a code review run afterwards, not by monitoring. Lesson: after an upgrade, diff the entity
  registry, not just the logs. Fixed by renaming `_2` back over websocket, no restart.

### Gemini image pricing
- Gemini 3 bills an image at a fixed 1148 / 575 / 312 tokens (high / medium / low) whatever its pixel size,
  so downscaling frames did nothing. Setting `media_resolution=MEDIUM` halved the image cost with no visible
  loss. Also disabled thinking (tiny custom component monkey-patching the AI Task config).
- Result: ≈1.3 gr per analysis (~4k input tokens), normal day ≈1 zł. Budget 30 zł/month.
- `gemini-2.5-flash` default got retired mid-project → `models/gemini-flash-latest`.

### Security footnote
- HA's `/local` is served without auth and HA is public via Cloudflare → snapshot filenames got a random suffix.
  Cloudflare caches them for 31 days (open TODO: bypass rule).

## Numbers worth quoting
- Normal day: 50–80 Gemini calls, ~1 zł. Worst day: ~13 zł (leaf storm).
- 2026-10-09: 1135 line crossings by 18:00; 149 vehicle triggers, 11 person.
- Alert latency: push ~30–35 s after detection (frames at +4/+8 s, Gemini ~20 s).

## Angle ideas
- "A cat is a vehicle": cheap edge detection + an LLM as the judge, and why the cheap layer must not be trusted
  with priority.
- Building a home system entirely through an agent over SSH: what it got wrong (upgrade, cap priority) and
  how review / monitoring caught it.
- Cost engineering for vision LLMs at home: per-image token pricing, caps, quotas.

## Mined from sessions 2026-10-06..09

Times local (CEST). Secrets left out. Sources: main camera session + its research / review subagents.

### Purchase decision (2026-10-05, ~14:00-14:50)
- Started from zero: Claude searched transcripts, Codex sessions, the Pi and HA for earlier camera work. Only trace was a
  vault note about Tapo + Frigate to trigger the cat pump.
- Brief: see who arrives and what they leave; live phone view; night; few cables; outlet exists; Wi-Fi "is what it is".
- Wi-Fi check first: phone speedtest at the spot = 20.7 Mb/s up vs 2-4 Mb/s a 2K stream needs.
- Claude's first pick was Tapo C325WB (~290 zl), then it flipped to Reolink RLC-811WA at "450-550 zl" (5x zoom, 4K, 5 GHz,
  official HA integration). Real price: 579 zl Allegro via Ceneo (Ceneo scrapable with curl, Allegro / Kaufland 403),
  701 zl Senetic; user found 670 zl. User: "big difference vs Tapo?" Claude reversed: ~380 zl gap, 2x the price, and
  the pasted Reolink reviews (9x 5-star, 2x 1-star, both "blurry") pointed at ~5 Mb/s max bitrate of the Wi-Fi model.
- Near-miss: user pasted RLC-810A (cheaper). Different model: PoE only, no Wi-Fi, no zoom - the exact cable-pulling he
  wanted to avoid. Lesson in the listing: the "W" in 811WA.
- Tapo case: big 1/1.79" sensor, f/1.0, colour night without a spotlight, 14-day return window as safety net. Review digest:
  silhouettes visible at 30+ m, clear faces only to ~15 m; complaints = false alarms (bin bags, a portable toilet seen as
  "vehicle"), two reports of Wi-Fi drops.
- Listing looked like hardware V1; V2.0 (firmware 1.3.2, June 2026) arrived. Power lead 3 m; adapter itself not waterproof.

### Day 1 (2026-10-06): box to AI descriptions in ~5 h
- Arrived ~16:50, first frame ~17:40 lying on a gazebo table. Stream: 2560x1440 @ 20 fps ~3 Mb/s; 720p ~1 Mb/s; 640x360 jpeg.
- First inventory found: hidden `clear_licence_plate_mode`, tamper detection off, 20 clips already on the card, speaker at
  100%. No glass-break / bark / meow detection on this model.
- Tapo Control gave `invalid_auth_cloud`: new firmware blocks third-party apps until Tapo Lab > Third-Party Compatibility
  is on. Two failed tries had triggered a 30 min lockout; Claude scheduled a retry and waited (passed ~19:50).
- Misdiagnosis: Claude blamed the Pi's "broken IPv6" for hanging downloads, later corrected (transient). Latest Tapo Control
  needs HA 2026.9 -> pinned 7.1.25 on HA 2025.11.
- Gemini: reused an idle key renamed "ABW Kamera"; first call 404 because default `gemini-2.5-flash` was retired.
- First E2E AI test ~21:26: photo + "analyzing...", ~20 s later replaced with "Nothing important, probably false alarm".
- First spam same evening: 5 pushes 21:49-21:55, all real people (household); motion sensor fired 52x in 3 h from vine
  leaves; user also got every alert twice (HA + Tapo app). Fixes: night = person / vehicle only, 10 min silence,
  "mute 1 h" notification button.
- ~00:24 live view froze again; HA answered in 0.1 s, the camera had run out of RTSP slots (HA live view, frame grabs, Tapo
  Control polling two camera entities every 30 s, the Tapo app) -> go2rtc as only client.
- Why HA at all: in the Tapo app only the registering account can switch floodlight / siren; shared users cannot. HA gives
  the fiancée the same buttons.
- Dashboard iterations: panel on Mushroom Home -> removed weather chips and no-cats-land tab (user: "yes, disable it for now")
  -> own Podwórko tab modelled on the cats tab -> last-event + 8-event list. 10-08: moved to its own sidebar entry
  (user complained it took two clicks), Media pushed to the bottom of the menu.

### Wi-Fi extender saga: extra detail (2026-10-07, 08:15-14:30)
- Order of guesses: 2K stream saturating the uplink (720p live view: 0% loss, 35 ms) -> hung again; Pi->router 0%,
  Pi->camera 40-44%, 1.5-7 s, same with go2rtc stopped -> camera reboot gave ~1 min of 4% / 19 ms, then 22% and 10 s pings.
- RSSI stayed strong (-38..-41) the whole time, which is what made it confusing: strong signal + awful throughput = bad link
  behind it. Tell: camera's own MAC differs from the one on the network (locally-administered copy of the Xiaomi repeater's).
- Table: via extender 22-44% loss, 1.5-7 s (10 s peak); direct to router 0%, 2.5 ms, live 720p + 2K snapshot in 0.3 s.
  Camera RSSI to router only -69; laptop at the same spot read -79 ("don't trust the laptop's antennas").
- Why not just remove the extender: user uses it to work in the shed behind the camera. Repeater has no MAC filter and only
  2.4 GHz, so: rename its SSID. (Offered: pull its token from Xiaomi cloud for local control; not pursued.)
- Aftershock ~14:00: camera got a new DHCP address (.18 -> .24); go2rtc / ONVIF / Tapo Control pointed at the old one and a
  different device answered there. DHCP reservation set in the ZTE router from a screenshot walk-through; the Pi's address
  had also drifted (.17 -> .16) and was pinned later.

### Privacy / legal: from masks to "just lower the camera" (10-05, 10-07)
- Day-0 summary from Claude: own plot only = household exemption; permanent filming of road / neighbour loses it (CJEU
  Rynes); neighbour can claim personal-rights violation. Suggested privacy masks (max 4 rectangles), gate left visible.
- 10-07 ~15:40 user: the fiancée keeps pushing to lower the camera, afraid of legal trouble over the road and neighbour.
- Masks failed twice: the app's "privacy mode" is the whole-lens cover ("I see privacy mode, not privacy zones"), and the
  rectangle could not be shrunk so it also blacked out the gate ("the exclusion square won't get smaller and still covers
  the gate xD"). The gate is slatted, so the street shows through it anyway.
- User's own idea: "can't we just lower it and draw nothing?" Claude: same effect for alerts; AI told that anyone emerging
  at the far end came from the street. Lowered; remaining sliver of the neighbour's house behind the hedge left unmasked.
  "Here the fiancée no longer makes a fuss."
- UPnP switched off (only speeds up remote viewing, exposes the camera to bots). HDR on. Main-stream bitrate found at 1.5 Mb/s,
  half of default (leftover from the Wi-Fi panic; API refuses to change it, -40214). Date stamp sat right on the gate.

### Cham tracking: how it came about (2026-10-07)
- ~15:58 first Volvo arrival after the camera went up. User: "scan that car that's arriving, enemy no. 1 ;)" and the goal
  "so the AI learns and tells me about this specific car".
- Claude: no training, a reference crop from that arrival + text (dark navy first-gen S60, silver 5-spoke rims, side
  scuffs). Pre-tested: parked Volvo recognised, empty yard not.
- Push title was "Enemy no. 1 has arrived"; user 16:09: "Not enemy, but Cham has arrived" -> "Cham nadciągnął" / "odjechał".
- Request that created the dashboard card: "can we have 'Monitoring Chama' to know how long he spends in the yard?"
  HA history only keeps 10 days, so own visit log. Mechanism: vehicle / gate trigger starts a visit, one frame per 10 min
  asks the AI "still there?" (~1 gr), closed after >20 min absent.
- First visit entered by hand: 15:58-16:13 (15 min). User on the empty history: "no earlier data because I was hanging the
  camera :P".
- Review caught on the same evening: end-of-visit script crashed (HA turns datetimes into strings in script variables) so
  Cham would "stay forever"; and a 90 min cap would announce "Cham left" just because night frames were too dark.
- Prompt gotcha chain: "someone got out of Cham" (17:48) -> user: "but Cham is exactly that person. He's a boor (cham) ;)".
  ("cham" = Polish for boor / lout, so the nickname is a pun.) Fixed in two prompts, committed.
- Cost tweak: reference photo only attached for vehicle / gate triggers (3 images instead of 4, ~25% cheaper). Downside: with
  the car parked and a person triggering, the AI may not name him.

### Alert-quality incidents not in the notes yet
- 10-07 14:35-14:48: 10 timeline entries, nearly all "person in light clothing" = household, none pushed but each a paid call.
  User: if the same person already walked around, why tell me again; notify about something NEW. -> last-8 timeline entries
  with "is-new" in the schema, then 10 min silence only after household pottering.
- Every description said "nothing was left" (user asked why). The prompt had asked it to state whether anything was left.
- 10-07 ~17:25: person sensor flapped 6x in 25 s, one analysis takes ~35 s, queue full ("Maximum number of runs exceeded");
  a car arriving then would be the dropped one. Also: the 45 s throttle overwrote the 10 min silence.
- 10-07 evening Volvo arrival gave no alert: collision with Claude's own test (45 s cooldown swallowed detections at 15:58:29
  and :32; only the driver getting out was caught, judged "pottering"). Rule since: vehicles queue, never dropped.
- 10-07 independent review chain requested by user ("fix everything, plan, implement, test, review, refactor, final test"):
  round 1 = 14 findings, 3 confirmed on live data.
- 10-08 ~09:05 push "person in dark vest with a bag walks from the gate towards the stairs": user said she came out of the
  house via the terrace. Porch corner sits near the end of the driveway in frame; prompt now describes frame geometry
  (gate = thin strip on the top edge). Verified on the same 3 frames.
- 10-08 ~12:30 the user and his mother-in-law drove in through the gate and nothing registered (vehicle sensitivity "normal").
  User: gate entries must have priority, pottering less. Birth of the gate line ("ultrathink ... without millions of tokens").
- Custom component reason: HA 2025.11 core had no handler for the ONVIF LineCross topic. Camera sends only the "crossed"
  pulse and never "off" -> sensor stayed on, later crossings ignored -> 5 s auto-reset; restored state re-set it after reload.
- First real gate event 10-08 12:10:31 (cyclist), push ~25-30 s later. A 13:15 bike exit was missed: line on the very top
  edge (few pixels for a cyclist) at sensitivity 50; at 80 the next cyclist (with a dog) was caught.
- 10-08 13:08 person at the bins behind the house, no push: household judged home (Gosia's phone "home" since 13:06).
- 10-08 18:03-18:45: 12 analyses, 10 pushes, all family + cats, because "night" meant "after sunset" (18:05). Eight "Exit"
  pushes in 30 min, one real gate crossing. User proposed night = 23:00-05:00 -> 1 push instead of 10.
- Floodlight off from HA returns `ONE_SECOND_REPEAT_REQUEST` (-40109): Smart Mode night vision owns the lamp; left alone.
- Health review find: every camera error contains the local go2rtc address, so a hung camera was reported as "go2rtc down,
  watchdog will fix" while the watchdog could do nothing. Test pushes during that work: 5-6 "🩺" pushes, incl. one for a
  go2rtc Claude stopped on purpose (watchdog restarted it: test passed).
- Android push mystery: 7 pushes sent to Gosia's phone without error from 10-07 evening, none seen. Checklist (channel,
  battery, Autostart, DND); test on a new high-priority "Podwórko" channel; that channel + ttl 0 then applied to all pushes.
- 10-08 12:51 user switched model and asked for a review of everything incl. panels: verdict "solid, better than most Tapo +
  HA setups", 8 points, each done as change -> check -> separate reviewer agent -> fix. One dashboard rebalancing: user
  "revert those changes" ("cofnij te zmiany"), reverted from git.

### Cost story with numbers (2026-10-08..09)
- 10-08 ~11:55 usage from Cloud Monitoring (no billing export), prices from the Cloud Billing catalogue: ~2.88 zl / 1M input
  tokens, ~14.41 zl / 1M output. Last 24 h 373k in / 57k out = ~1.90 zl; day before 0.19 zl. Projection ~55 zl/month, 15-25 zl
  after the pottering silence.
- Savings agreed: thinking off (tiny custom component, -470 output tokens per call, same description), reference photo only
  for vehicle / gate, budget 30 zl/month with mails at 50 / 90 / 100% and on forecast. Est. -50-60% per analysis.
- Leaf night: 366 calls 23:00-05:00 (~2.1M input, ~6.30 zl) + ~175 until 08:40 fix (~3.10 zl) = ~540 calls, ~9.40 zl; the
  day's total ~13 zl; day before ~1.40 zl. One call then ~5.7k tokens (~1.7 gr); after `media_resolution` ~1.3 gr.
- Google 503 between 01:15 and 01:25; fallback pushed the raw trigger -> five identical "Person from the street - no AI
  description" pushes, which is what the user asked about at 08:35 ("what is this series of messages at night?"). Now throttled
  to one per 15 min.
- GCP cannot hard-stop spend: tier 1 has no daily quota, only per-minute; override (6 req/min) took ~10 min to propagate,
  verified: 9 fast calls, 429 after the sixth. A daily kill-switch would need a Cloud Function on the budget alert; not built.
- Daily cap from budget: >120 calls = vehicles only, >200 = nothing; worst day ~2.6 zl instead of 13 zl. Own goal 10-09:
  cap sat in automation conditions, counter was 516 from the storm, so from ~11:43 nothing ran (no analysis, push or timeline)
  until ~13:08; a car at ~12:25 left no trace. User: "meanwhile a car did arrive but you didn't let me know". Claude: my
  mistake, should have reset the counter after fixing the line. Cap moved into the action; exhausted cap still pushes
  vehicles / gate with "no description, AI limit exhausted".

### Leaf storm: extra detail (night 10-08/09)
- Line's target filter (person / vehicle / bike) was off and it crossed the vines left of frame; in IR leaves "crossed" it
  150-180x/h, 23:00-05:00. The gate line was exempt from the daily cap, so each crossing = a Gemini run on an empty frame.
- User redrew the line shorter (top-left, gate opening) ~08:55; saving in the app reset the target filter again -> script
  re-asserts it (23:00 / 05:00 / HA start); HA-side correlation as plan B.
- Line sensitivity by schedule: day 60, night 30, set via pytapo (camera has no schedule). History 50 -> 80 -> 60 / 30.
- Daily report now shows "gate line: N crossings, AI runs M, events K"; it read 1017 crossings by ~14:00 on 10-09.
- Parked on purpose: full-colour night mode (TP-Link's official anti-IR-bug advice) = floodlight on all night; user's call.
- User at 09:01: "at night I think there's no point being so sensitive" after a "bird flies low over the driveway" push.

### Web-research findings (3 Sonnet agents, 10-09 ~10:45, ~150k tokens, ~3 min; partly search snippets, flagged as such)
- TP-Link advice for false night triggers: Full-Colour night (IR lights up spiders, rain, insects near the lens); keep lines off
  wet ground / glass; schedule detection; subjects best 1.5-5 m away. Support on another model: "no sensitivity option for
  Line-Crossing Detection"; users disabled it and used motion at sensitivity <= 3.
- Firmware risk: a C520WS firmware change to the line event made HA stop seeing it. Phantom person / vehicle sensors on an
  ~8 min cycle traced to the integration's event-subscription renewal; a PullPoint-based custom integration renews every
  480 s and collapses ~18 duplicate events/s.
- HA core LineCrossDetector for Tapo: PR #183363 (onvif_parsers 2.5.0), merged late Sept 2026. pytapo can only toggle the line,
  not set geometry or target filter. Not found anywhere: whether the app resets the target filter on save (we hit it live).
- Camera limits: ~3 local viewers incl. RTSP / ONVIF; 2 main + 2 sub-streams; some "device limit" errors with two clients.
- AI setups: LLM Vision (memory images, timeline), Frigate GenAI (per-label prompts), `ai_task.generate_data`. A popular
  blueprint is deliberately minimal (60 s cooldown, one-sentence prompt, no cost control). Docs: 280 / 560 / 1120 tokens per
  image (measured here 312 / 575 / 1148). No precedent found for the "same as previous event?" trick.
- Frigate on a Pi 5 is documented mainly with Coral / Hailo; Tapo's own ONVIF events are the lightweight pre-filter.
- Implemented from it: HA upgrade 2025.11.3 -> 2026.10.0 (Docker 20.10 -> 29.9 after a pull failed with "invalid tar header",
  zstd layers), iOS interruption levels, one tag per category, "Preview" button, instant "Someone at the gate" push replaced by
  the AI verdict ~30 s later (or retracted), correlation guard, crossing counter. Not implemented: full-colour night, PullPoint
  integration, photo-then-video two-stage analysis.
- Upgrade check at 11:02 looked clean (28 automations, dashboard 200, Gemini call 1641 tokens) yet the pipeline was dead
  (`_2` entities; found ~12:35 by `/code-review`). Claude: "I checked the component logs, not the entities."

### Ideas considered and parked / rejected
- Imperial March when the owner comes home (person in yard + phone just turned "home" -> Nest speaker): offered on day 1,
  re-offered as "for fun" every time, never picked. Gotcha: plain TTS on a Nest kills the music and doesn't resume it.
- RuView (Wi-Fi CSI sensing), pasted by user 10-07: README admits 82% presence after retracting "100%", pose model 3% vs 35%
  target, ~5 m through a wall; useless for a 30-40 m yard. Suggested mmWave (LD2410 / Aqara FP2) indoors.
- Licence plates: rejected (30-40 m, wide lens). Frigate + accelerator (~300 zl): only for 24/7 recording. LLM Vision: same as
  the custom setup. `tapo://` in go2rtc for two-way audio: held back to protect RTSP sessions. Tapo Care cloud: never enabled.
- Never built: tamper alert, night deterrence ladder (light -> voice after 20 s -> siren), parcel reminder, scheduled "is the
  gate open at 22:00?", time-lapse. Built from the list: 21:00 daily summary (also mentions tomorrow's waste pickup).

### Quotes and small human moments
- 10-08 ~13:36 the fiancée wanted to brag in a TikTok review comment; user asked for 1-2 sentences "and say Gosia is happy".
  Result: "My fiancé hooked the Tapo C325WB to Home Assistant with Google Gemini AI: the camera describes who comes through the gate
  or which car drives in and sends it to us with a photo. I'm very happy!"
- User style: dictated casual Polish, one-line course corrections ("cofnij te zmiany", "tak", "Zrób 1, 2, 3 po kolei, każdą
  osobno z testem"); prefers fewer pushes over faster; asked for the real fix after Claude called its leaf-night measures
  "plasters on the symptoms".
- Commits only on request, local `main`, nothing pushed; three commits on 10-08 (gate line, AI without thinking, dashboards +
  health self-heal).

## Live log

### 2026-10-09 18:18–18:20: blind after the cap
- After the cat-as-vehicle fix the counter still read 155/120 (spent by the bug), so every non-gate detection
  ran "without AI": a real car at the gate (18:18) and a person with a bicycle (18:19) were reduced to a
  "limit reached" push, the person silently dropped, and nothing reached the timeline. 18:20: same push for an
  empty frame (Tapo vehicle false positive). The line didn't fire for that car, so it couldn't lift the cap.
- Fix: counter reset for the day; a capped car push now also writes a timeline entry.
- Lesson: a fix to the cause doesn't undo state the bug already accumulated (a daily counter).

### 2026-10-09 ~18:25: user redraws the line
- Too many notifications → user moved the line lower (y 11% → 15% of frame, closer to the camera) and set
  direction to one-way ("entering", BtoA). Saving in the Tapo app reset the target filter to off AGAIN —
  re-enabled by the script. The new line's left end reaches into the vine leaves (the original noise source).
- 18:26: second redraw: diagonal line from the left edge of the paving (clear of the leaves) up to the house wall.
  App save reset the target filter a third time today → re-enabled. Rule now: after ANY line edit in the app, re-run the filter script.

### 2026-10-11 16:16: the user's own bike arrival missed
- Person sensor went on at 16:16:07 during a 10-min "household" cooldown (set at 16:06). Line crossed at 16:16:08 and
  lifted the cooldown, but the sensor stayed "on" until 16:16:35 → no new trigger. Next detection 16:16:37: 29 s
  after the crossing, outside the 15 s gate-hint window → Gemini saw a man with a bike in the yard → "household",
  no push. Going back to close the gate → "person from the street" push. Comically inverted.
- Also confirmed: one-way line BtoA = entering (the walk back to the gate didn't fire it).
- Fix: line triggers again, but only together with an active / ≤15 s old person or vehicle detection, bypassing
  cooldowns; importance still decided by the model's verdict (no forced push). Edge-triggered sensors + cooldowns
  = an event that starts during a cooldown is invisible until the sensor toggles again.

- **2026-10-12, outage**: Cham arrived during an internet/power outage, and no push came. Kumak (the Pi) went down hard around 14:30. It came back at 16:45 with an unclean SQLite shutdown, and the Pi has no RTC, so `last` shows a fake-hwclock boot time of 14:17. The camera kept recording to SD until 15:41, so the SD card was the only witness. The AI-failure fallback ("Brak opisu AI", raw Tapo trigger → timeline) never ran, because HA itself was down. Lesson: the whole pipeline needs the Pi + router + internet; the SD card is the offline backup. On boot the visit flag `cham_na_podworku` was reset to off, so the system "forgot" Cham was there.
  - Forensics afterwards: pulled clips off the SD card with pytapo's `Downloader` (~3 min per 3-min clip over the LAN) and tiled frames with ffmpeg. Cham drove in at 16:46, right as the power came back, while HA was still booting (up at 16:48). He left at 17:16. Clock gotcha: the camera's recording list (epoch) was +1 h off the burned-in overlay before the outage, matched it right after boot, then went +1 h again after NTP sync. **Trust the overlay, not the list.** The visit was then recorded manually via `cham_koniec_wizyty`.
  - Bonus finding: the 16:58 run described the car as a "dark estate (kombi)", but the prompt says Cham drives an S60 *sedan*. The frames show a wagon (V70-ish), so Gemini didn't match it. The prompt was wrong, not the model.
- **2026-10-13, "which car was it?"**: Cham turned out to have two Volvos, an S60 sedan (the reference) and a V70/XC70 estate. So the 12.10 miss was a reference problem. Fixed by adding a second reference image under the same `wrog_nr_1` key (the detection prompt now gets 5 images on car triggers). On Sunday he also came in a white Fiat Punto Evo; not added (yet): a white Punto is common enough that false matches are a risk.
- **SD forensics, part 2**: on the DST/clock-confused day (11.10) the SD index contained two interleaved clip series with overlapping timestamps (e.g. 15:15:01/15:16:46/15:18:01…). One series was a different hour of footage carrying the same labels. Pulled the right 6 min, extracted the 8 kHz AAC audio (highpass + loudnorm), and sent it to Gemini (`gemini-pro-latest`, inline WAV) for a speaker-labelled transcript. The tiny camera mic was perfectly intelligible at ~2 m. Privacy angle for the article: the camera hears conversations under it, worth a paragraph.
- **2026-10-13 10:42, first estate visit after adding the 2nd reference — still missed.** The estate's own vehicle triggers were blocked (busy check / vehicle cooldown from an earlier false vehicle at 10:38). The driver's *person* trigger 20 s later ran, but person runs skip the reference photos (a cost optimisation), so Gemini wrote "dark estate arrived" with `znane_auto: brak`. Fix: attach references also when the vehicle sensor was on in the last 2 min. Classic: a cost optimisation silently disabled a feature.
- **2026-10-13 11:11, departure went unnoticed.** The system detected it fine (AI: odjazd + wrog → end-of-visit script), but by design the departure only sent a push with `interruption-level: passive` (iOS files it silently) and wrote no timeline entry. The user's mental model was "Zdarzenia = everything". Fix: the end-of-visit script now also writes to the timeline (the alert photo, or a copy of the last presence-check frame) and the push is normal. HA gotcha met on the way: `variables` set inside an `if/then` don't reach the outer scope, so compute them before the branch.

## 2026-10-13 — the cheapest fix was in the Tapo app
After the AI cap ran out on a busy day, Szymon lowered the camera's own detection zone (the rectangle in the Tapo app) so it stops catching street traffic. Filtering at the source beats filtering in HA: fewer ONVIF events → fewer Gemini calls. Risk to watch: arrivals at the gate must still fall inside the zone.

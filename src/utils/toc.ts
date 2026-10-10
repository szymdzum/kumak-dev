const TOC_LINK_SELECTOR = "[data-toc] a";
const TOC_LIST_SELECTOR = "[data-toc-list]";

function initTableOfContents(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(TOC_LINK_SELECTOR));
  const list = document.querySelector<HTMLElement>(TOC_LIST_SELECTOR);
  if (links.length === 0 || !list) return;

  const targets = new Map<Element, number>();

  function activate(index: number): void {
    links.forEach((link, i) => {
      if (i === index) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
      link.parentElement?.toggleAttribute("data-read", i < index);
    });

    const item = links[index]?.parentElement;
    if (!item) return;
    const listRect = list!.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const progress = ((itemRect.top - listRect.top + itemRect.height / 2) / listRect.height) * 100;
    list!.style.setProperty("--toc-progress", `${Math.min(progress, 100)}%`);
  }

  links.forEach((link, index) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;

    targets.set(target, index);
    target.tabIndex = -1; // focus target for TOC links

    link.addEventListener("click", (e) => {
      e.preventDefault();
      activate(index);
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      target.focus({ preventScroll: true });

      if (document.startViewTransition) {
        document.startViewTransition(() => target.scrollIntoView({ behavior: "instant" }));
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const index = targets.get(entry.target);
        if (entry.isIntersecting && index !== undefined) activate(index);
      }
    },
    { rootMargin: "-10% 0% -70% 0%" },
  );
  targets.forEach((_, target) => observer.observe(target));
  document.addEventListener("astro:before-swap", () => observer.disconnect(), { once: true });
}

document.addEventListener("astro:page-load", initTableOfContents);

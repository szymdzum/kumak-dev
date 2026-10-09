const HEADING_SELECTOR = "article h1[id], article h2[id]";
const TOC_LINK_SELECTOR = "[data-toc] a";
const TOC_LIST_SELECTOR = "[data-toc-list]";

function clearActiveStates(links: NodeListOf<HTMLAnchorElement>): void {
  links.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });
}

function activateLink(link: HTMLAnchorElement, links: NodeListOf<HTMLAnchorElement>): void {
  clearActiveStates(links);
  link.classList.add("active");
  link.setAttribute("aria-current", "location");
}

function updateReadingProgress(
  activeIndex: number,
  tocList: HTMLUListElement,
  items: HTMLLIElement[],
): void {
  if (items.length === 0) return;

  items.forEach((item, i) => {
    if (i < activeIndex) {
      item.setAttribute("data-read", "");
    } else {
      item.removeAttribute("data-read");
    }
  });

  const activeItem = items[activeIndex];
  if (!activeItem) return;

  const listRect = tocList.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  const progressHeight = itemRect.top - listRect.top + itemRect.height / 2;
  const progressPercent = (progressHeight / listRect.height) * 100;

  tocList.style.setProperty("--toc-progress", `${Math.min(progressPercent, 100)}%`);
}

function initTableOfContents(): void {
  const headings = document.querySelectorAll<HTMLHeadingElement>(HEADING_SELECTOR);
  const tocLinks = document.querySelectorAll<HTMLAnchorElement>(TOC_LINK_SELECTOR);
  const tocList = document.querySelector<HTMLUListElement>(TOC_LIST_SELECTOR);

  if (headings.length === 0 || tocLinks.length === 0 || !tocList) return;

  const tocItems = Array.from(tocList.querySelectorAll<HTMLLIElement>("li"));

  const linkMap = new Map<string, { link: HTMLAnchorElement; index: number }>();
  tocLinks.forEach((link, index) => {
    const id = link.getAttribute("href")?.slice(1);
    if (id) linkMap.set(id, { link, index });
  });

  tocLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      activateLink(link, tocLinks);
      const data = id ? linkMap.get(id) : null;
      if (data) updateReadingProgress(data.index, tocList, tocItems);

      if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
      target.focus({ preventScroll: true });

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          target.scrollIntoView({ behavior: "instant" });
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const data = linkMap.get(entry.target.id);
          if (data) {
            activateLink(data.link, tocLinks);
            updateReadingProgress(data.index, tocList, tocItems);
          }
        }
      }
    },
    { rootMargin: "-10% 0% -70% 0%" },
  );

  headings.forEach((heading) => {
    heading.tabIndex = -1; // focus target for TOC links
    observer.observe(heading);
  });
}

document.addEventListener("astro:page-load", initTableOfContents);

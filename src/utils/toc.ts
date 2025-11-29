const HEADING_SELECTOR = "article h1[id], article h2[id]";
const TOC_LINK_SELECTOR = "[data-toc] a";

function clearActiveStates(links: NodeListOf<HTMLAnchorElement>): void {
  links.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });
}

function activateLink(link: HTMLAnchorElement, links: NodeListOf<HTMLAnchorElement>): void {
  clearActiveStates(links);
  link.classList.add("active");
  link.setAttribute("aria-current", "true");
}

function initTableOfContents(): void {
  const headings = document.querySelectorAll<HTMLHeadingElement>(HEADING_SELECTOR);
  const tocLinks = document.querySelectorAll<HTMLAnchorElement>(TOC_LINK_SELECTOR);

  if (headings.length === 0 || tocLinks.length === 0) return;

  const linkMap = new Map<string, HTMLAnchorElement>();
  tocLinks.forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (id) linkMap.set(id, link);
  });

  tocLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      activateLink(link, tocLinks);

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
          const link = linkMap.get(entry.target.id);
          if (link) activateLink(link, tocLinks);
        }
      }
    },
    { rootMargin: "-10% 0% -70% 0%" },
  );

  headings.forEach((heading) => observer.observe(heading));
}

document.addEventListener("astro:page-load", initTableOfContents);

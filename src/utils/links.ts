import type { RehypePlugin } from "@astrojs/markdown-remark";
import { visitElements } from "./hast";

interface ExternalLinksOptions {
  domain: string;
}

function isExternalLink(href: string, siteDomain: string): boolean {
  const url = URL.parse(href);
  if (!url || !/^https?:$/.test(url.protocol)) return false;
  return url.hostname !== siteDomain && !url.hostname.endsWith(`.${siteDomain}`);
}

/** Opens links to other sites in a new tab with rel="noopener noreferrer". */
export const externalLinks: RehypePlugin<[ExternalLinksOptions]> = ({ domain }) => (tree) => {
  visitElements(tree, (node) => {
    if (node.tagName !== "a") return;
    if (!isExternalLink(String(node.properties.href ?? ""), domain)) return;
    node.properties.target = "_blank";
    node.properties.rel = ["noopener", "noreferrer"];
  });
};

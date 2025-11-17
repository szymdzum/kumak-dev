import type { RehypePlugin } from "@astrojs/markdown-remark";
import type { Element, Root, RootContent } from "hast";

interface ExternalLinksOptions {
  domain: string;
}

type WalkCallback = (node: RootContent) => void;

export const externalLinks: RehypePlugin<[ExternalLinksOptions?]> = (
  options,
) => {
  const siteDomain = options?.domain ?? "";

  return (tree: Root) => {
    walk(tree, (node) => {
      if (node.type !== "element") return;

      const element = node as Element;
      if (element.tagName !== "a" || !element.properties?.href) return;

      const href = String(element.properties.href);

      if (href.startsWith("http") && !href.includes(siteDomain)) {
        element.properties.target = "_blank";
        element.properties.rel = "noopener noreferrer";
      }
    });
  };
};

function walk(node: Root | RootContent, callback: WalkCallback): void {
  if ("children" in node) {
    for (const child of node.children) {
      callback(child);
      walk(child, callback);
    }
  }
}

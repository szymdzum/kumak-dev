import type { RehypePlugin } from "@astrojs/markdown-remark";
import type { Element, Root, RootContent } from "hast";

interface ExternalLinksOptions {
  domain: string;
}

type NodeCallback = (node: RootContent) => void;

function isElement(node: RootContent): node is Element {
  return node.type === "element";
}

function isAnchorWithHref(element: Element): boolean {
  return element.tagName === "a" && Boolean(element.properties?.href);
}

function isExternalLink(href: string, siteDomain: string): boolean {
  return href.startsWith("http") && !href.includes(siteDomain);
}

function applyExternalLinkAttributes(element: Element): void {
  if (!element.properties) {
    element.properties = {};
  }
  element.properties.target = "_blank";
  element.properties.rel = "noopener noreferrer";
}

function walkTree(node: Root | RootContent, callback: NodeCallback): void {
  if ("children" in node) {
    for (const child of node.children) {
      callback(child);
      walkTree(child, callback);
    }
  }
}

export const externalLinks: RehypePlugin<[ExternalLinksOptions?]> = (options) => {
  const siteDomain = options?.domain ?? "";

  return (tree: Root) => {
    walkTree(tree, (node) => {
      if (!isElement(node)) return;
      if (!isAnchorWithHref(node)) return;

      const href = String(node.properties?.href ?? "");

      if (isExternalLink(href, siteDomain)) {
        applyExternalLinkAttributes(node);
      }
    });
  };
};

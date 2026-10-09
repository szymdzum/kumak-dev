import type { RehypePlugin } from "@astrojs/markdown-remark";
import type { Element, Root } from "hast";

/**
 * Wraps every <table> in a horizontally scrollable <div data-table-scroll>.
 * Scrolling the table itself needs `display: block`, which strips its table
 * semantics from the accessibility tree.
 */
export const scrollableTables: RehypePlugin = () => (tree: Root) => {
  const visit = (node: Root | Element): void => {
    node.children.forEach((child, index) => {
      if (child.type !== "element") return;
      if (child.tagName === "table") {
        node.children[index] = {
          type: "element",
          tagName: "div",
          properties: { dataTableScroll: "" },
          children: [child],
        };
      } else {
        visit(child);
      }
    });
  };
  visit(tree);
};

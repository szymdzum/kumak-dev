import type { RehypePlugin } from "@astrojs/markdown-remark";
import { visitElements } from "./hast";

/**
 * Wraps every <table> in a horizontally scrollable <div data-table-scroll>.
 * Scrolling the table itself needs `display: block`, which strips its table
 * semantics from the accessibility tree.
 */
export const scrollableTables: RehypePlugin = () => (tree) => {
  visitElements(tree, (node, index, parent) => {
    if (node.tagName !== "table") return;
    parent.children[index] = {
      type: "element",
      tagName: "div",
      properties: { dataTableScroll: "" },
      children: [node],
    };
  });
};

import type { Element, Root } from "hast";

export type ElementVisitor = (node: Element, index: number, parent: Root | Element) => void;

/** Depth-first visit of every element; the visitor may replace `parent.children[index]`. */
export function visitElements(tree: Root | Element, visit: ElementVisitor): void {
  tree.children.forEach((child, index) => {
    if (child.type !== "element") return;
    visit(child, index, tree);
    visitElements(child, visit);
  });
}

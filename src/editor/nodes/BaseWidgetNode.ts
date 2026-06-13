import type { LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";
import type { ReactNode } from "react";

export type SerializedWidgetNode = Spread<
  {
    type: string;
    version: 1;
  },
  SerializedLexicalNode
>;

export abstract class BaseWidgetNode extends DecoratorNode<ReactNode> {
  static getType(): string {
    throw new Error("BaseWidgetNode must implement getType");
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  isInline(): boolean {
    return true;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "widget-inline";
    return span;
  }

  updateDOM(): false {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return false;
  }
}

export function $isWidgetNode(node: LexicalNode | null | undefined): node is BaseWidgetNode {
  return node instanceof BaseWidgetNode;
}

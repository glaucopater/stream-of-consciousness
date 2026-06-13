import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedLabelWidgetNode = Spread<
  {
    text: string;
    type: "label-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useLabelWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [text, setText] = useState("Label");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isLabelWidgetNode(node)) {
          setText(node.getText());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { text };
}

function LabelWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const { text } = useLabelWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <span className="widget-label-control">{text}</span>
    </WidgetShell>
  );
}

export class LabelWidgetNode extends BaseWidgetNode {
  __text: string;

  static getType(): string {
    return "label-widget";
  }

  static clone(node: LabelWidgetNode): LabelWidgetNode {
    return new LabelWidgetNode(node.__text, node.__key);
  }

  constructor(text = "Label", key?: NodeKey) {
    super(key);
    this.__text = text;
  }

  static importJSON(serializedNode: SerializedLabelWidgetNode): LabelWidgetNode {
    return new LabelWidgetNode(serializedNode.text);
  }

  exportJSON(): SerializedLabelWidgetNode {
    return {
      ...super.exportJSON(),
      text: this.__text,
      type: "label-widget",
      version: 1,
    };
  }

  getText(): string {
    return this.getLatest().__text;
  }

  setText(text: string): void {
    const self = this.getWritable();
    self.__text = text;
  }

  createDOM(): HTMLElement {
    const span = super.createDOM();
    span.className = "widget-inline widget-label";
    return span;
  }

  decorate(): ReactNode {
    return <LabelWidget nodeKey={this.__key} />;
  }
}

export function $createLabelWidgetNode(text = "Label"): LabelWidgetNode {
  return new LabelWidgetNode(text);
}

export function $isLabelWidgetNode(
  node: LexicalNode | null | undefined,
): node is LabelWidgetNode {
  return node instanceof LabelWidgetNode;
}

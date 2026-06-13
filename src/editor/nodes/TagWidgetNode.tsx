import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedTagWidgetNode = Spread<
  {
    text: string;
    type: "tag-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useTagWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [text, setText] = useState("tag");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isTagWidgetNode(node)) {
          setText(node.getText());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { text };
}

function TagWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const { text } = useTagWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <span className="widget-tag-pill">{text}</span>
    </WidgetShell>
  );
}

export class TagWidgetNode extends BaseWidgetNode {
  __text: string;

  static getType(): string {
    return "tag-widget";
  }

  static clone(node: TagWidgetNode): TagWidgetNode {
    return new TagWidgetNode(node.__text, node.__key);
  }

  constructor(text = "tag", key?: NodeKey) {
    super(key);
    this.__text = text;
  }

  static importJSON(serializedNode: SerializedTagWidgetNode): TagWidgetNode {
    return new TagWidgetNode(serializedNode.text);
  }

  exportJSON(): SerializedTagWidgetNode {
    return {
      ...super.exportJSON(),
      text: this.__text,
      type: "tag-widget",
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
    span.className = "widget-inline widget-tag";
    return span;
  }

  decorate(): ReactNode {
    return <TagWidget nodeKey={this.__key} />;
  }
}

export function $createTagWidgetNode(text = "tag"): TagWidgetNode {
  return new TagWidgetNode(text);
}

export function $isTagWidgetNode(
  node: LexicalNode | null | undefined,
): node is TagWidgetNode {
  return node instanceof TagWidgetNode;
}

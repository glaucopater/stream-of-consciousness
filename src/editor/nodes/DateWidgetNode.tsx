import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { keepEditorFocusOut } from "../widgets/widgetInteraction";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedDateWidgetNode = Spread<
  {
    type: "date-widget";
    value: string;
    version: 1;
  },
  SerializedLexicalNode
>;

function useDateWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [value, setValue] = useState("");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isDateWidgetNode(node)) {
          setValue(node.getValue());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { setValue, value };
}

function DateWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const { value, setValue } = useDateWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <input
        className="widget-date-control"
        type="date"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isDateWidgetNode(node)) {
              node.setValue(nextValue);
            }
          });
        }}
        onKeyDown={keepEditorFocusOut}
        onMouseDown={keepEditorFocusOut}
      />
    </WidgetShell>
  );
}

export class DateWidgetNode extends BaseWidgetNode {
  __value: string;

  static getType(): string {
    return "date-widget";
  }

  static clone(node: DateWidgetNode): DateWidgetNode {
    return new DateWidgetNode(node.__value, node.__key);
  }

  constructor(value = "", key?: NodeKey) {
    super(key);
    this.__value = value;
  }

  static importJSON(serializedNode: SerializedDateWidgetNode): DateWidgetNode {
    return new DateWidgetNode(serializedNode.value ?? "");
  }

  exportJSON(): SerializedDateWidgetNode {
    return {
      ...super.exportJSON(),
      type: "date-widget",
      value: this.__value,
      version: 1,
    };
  }

  getValue(): string {
    return this.getLatest().__value;
  }

  setValue(value: string): void {
    const self = this.getWritable();
    self.__value = value;
  }

  isIsolated(): boolean {
    return true;
  }

  createDOM(): HTMLElement {
    const span = super.createDOM();
    span.className = "widget-inline widget-date";
    return span;
  }

  decorate(): ReactNode {
    return <DateWidget nodeKey={this.__key} />;
  }
}

export function $createDateWidgetNode(): DateWidgetNode {
  return new DateWidgetNode();
}

export function $isDateWidgetNode(
  node: LexicalNode | null | undefined,
): node is DateWidgetNode {
  return node instanceof DateWidgetNode;
}

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { keepEditorFocusOut } from "../widgets/widgetInteraction";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedTimeWidgetNode = Spread<
  {
    type: "time-widget";
    value: string;
    version: 1;
  },
  SerializedLexicalNode
>;

function useTimeWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [value, setValue] = useState("");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isTimeWidgetNode(node)) {
          setValue(node.getValue());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { setValue, value };
}

function TimeWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const { value, setValue } = useTimeWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <input
        className="widget-time-control"
        type="time"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isTimeWidgetNode(node)) {
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

export class TimeWidgetNode extends BaseWidgetNode {
  __value: string;

  static getType(): string {
    return "time-widget";
  }

  static clone(node: TimeWidgetNode): TimeWidgetNode {
    return new TimeWidgetNode(node.__value, node.__key);
  }

  constructor(value = "", key?: NodeKey) {
    super(key);
    this.__value = value;
  }

  static importJSON(serializedNode: SerializedTimeWidgetNode): TimeWidgetNode {
    return new TimeWidgetNode(serializedNode.value ?? "");
  }

  exportJSON(): SerializedTimeWidgetNode {
    return {
      ...super.exportJSON(),
      type: "time-widget",
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
    span.className = "widget-inline widget-time";
    return span;
  }

  decorate(): ReactNode {
    return <TimeWidget nodeKey={this.__key} />;
  }
}

export function $createTimeWidgetNode(): TimeWidgetNode {
  return new TimeWidgetNode();
}

export function $isTimeWidgetNode(
  node: LexicalNode | null | undefined,
): node is TimeWidgetNode {
  return node instanceof TimeWidgetNode;
}

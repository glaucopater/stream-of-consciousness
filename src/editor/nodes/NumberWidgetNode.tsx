import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { keepEditorFocusOut } from "../widgets/widgetInteraction";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedNumberWidgetNode = Spread<
  {
    placeholder: string;
    type: "number-widget";
    value: string;
    version: 1;
  },
  SerializedLexicalNode
>;

function useNumberWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [placeholder, setPlaceholder] = useState("0");
  const [value, setValue] = useState("");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isNumberWidgetNode(node)) {
          setPlaceholder(node.getPlaceholder());
          setValue(node.getValue());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { placeholder, setValue, value };
}

function NumberWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const { placeholder, value, setValue } = useNumberWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <input
        className="widget-number-control"
        placeholder={placeholder}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isNumberWidgetNode(node)) {
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

export class NumberWidgetNode extends BaseWidgetNode {
  __placeholder: string;
  __value: string;

  static getType(): string {
    return "number-widget";
  }

  static clone(node: NumberWidgetNode): NumberWidgetNode {
    return new NumberWidgetNode(node.__placeholder, node.__value, node.__key);
  }

  constructor(placeholder = "0", value = "", key?: NodeKey) {
    super(key);
    this.__placeholder = placeholder;
    this.__value = value;
  }

  static importJSON(serializedNode: SerializedNumberWidgetNode): NumberWidgetNode {
    return new NumberWidgetNode(
      serializedNode.placeholder ?? "0",
      serializedNode.value ?? "",
    );
  }

  exportJSON(): SerializedNumberWidgetNode {
    return {
      ...super.exportJSON(),
      placeholder: this.__placeholder,
      type: "number-widget",
      value: this.__value,
      version: 1,
    };
  }

  getPlaceholder(): string {
    return this.getLatest().__placeholder;
  }

  setPlaceholder(placeholder: string): void {
    const self = this.getWritable();
    self.__placeholder = placeholder;
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
    span.className = "widget-inline widget-number";
    return span;
  }

  decorate(): ReactNode {
    return <NumberWidget nodeKey={this.__key} />;
  }
}

export function $createNumberWidgetNode(): NumberWidgetNode {
  return new NumberWidgetNode();
}

export function $isNumberWidgetNode(
  node: LexicalNode | null | undefined,
): node is NumberWidgetNode {
  return node instanceof NumberWidgetNode;
}

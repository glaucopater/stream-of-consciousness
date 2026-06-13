import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { keepEditorFocusOut } from "../widgets/widgetInteraction";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedInputWidgetNode = Spread<
  {
    placeholder: string;
    value: string;
    type: "input-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useInputWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [placeholder, setPlaceholder] = useState("Type here…");
  const [value, setValue] = useState("");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isInputWidgetNode(node)) {
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

function InputWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const { placeholder, value, setValue } = useInputWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <input
        className="widget-input-control"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isInputWidgetNode(node)) {
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

export class InputWidgetNode extends BaseWidgetNode {
  __placeholder: string;
  __value: string;

  static getType(): string {
    return "input-widget";
  }

  static clone(node: InputWidgetNode): InputWidgetNode {
    return new InputWidgetNode(node.__placeholder, node.__value, node.__key);
  }

  constructor(placeholder = "Type here…", value = "", key?: NodeKey) {
    super(key);
    this.__placeholder = placeholder;
    this.__value = value;
  }

  static importJSON(serializedNode: SerializedInputWidgetNode): InputWidgetNode {
    return new InputWidgetNode(
      serializedNode.placeholder,
      serializedNode.value ?? "",
    );
  }

  exportJSON(): SerializedInputWidgetNode {
    return {
      ...super.exportJSON(),
      placeholder: this.__placeholder,
      value: this.__value,
      type: "input-widget",
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
    span.className = "widget-inline widget-input";
    return span;
  }

  decorate(): ReactNode {
    return <InputWidget nodeKey={this.__key} />;
  }
}

export function $createInputWidgetNode(placeholder = "Type here…"): InputWidgetNode {
  return new InputWidgetNode(placeholder);
}

export function $isInputWidgetNode(
  node: LexicalNode | null | undefined,
): node is InputWidgetNode {
  return node instanceof InputWidgetNode;
}

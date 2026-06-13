import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedCheckboxWidgetNode = Spread<
  {
    checked: boolean;
    label: string;
    type: "checkbox-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useCheckboxWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [label, setLabel] = useState("Item");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isCheckboxWidgetNode(node)) {
          setLabel(node.getLabel());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { label };
}

function CheckboxWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const { label } = useCheckboxWidgetProps(nodeKey);
  const [checked, setChecked] = useState(false);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <label className="widget-checkbox-control">
        <input
          checked={checked}
          type="checkbox"
          onChange={(event) => setChecked(event.target.checked)}
          onMouseDown={(event) => event.preventDefault()}
        />
        <span>{label}</span>
      </label>
    </WidgetShell>
  );
}

export class CheckboxWidgetNode extends BaseWidgetNode {
  __label: string;

  static getType(): string {
    return "checkbox-widget";
  }

  static clone(node: CheckboxWidgetNode): CheckboxWidgetNode {
    return new CheckboxWidgetNode(node.__label, node.__key);
  }

  constructor(label = "Item", key?: NodeKey) {
    super(key);
    this.__label = label;
  }

  static importJSON(serializedNode: SerializedCheckboxWidgetNode): CheckboxWidgetNode {
    return new CheckboxWidgetNode(serializedNode.label);
  }

  exportJSON(): SerializedCheckboxWidgetNode {
    return {
      ...super.exportJSON(),
      checked: false,
      label: this.__label,
      type: "checkbox-widget",
      version: 1,
    };
  }

  getLabel(): string {
    return this.getLatest().__label;
  }

  setLabel(label: string): void {
    const self = this.getWritable();
    self.__label = label;
  }

  createDOM(): HTMLElement {
    const span = super.createDOM();
    span.className = "widget-inline widget-checkbox";
    return span;
  }

  decorate(): ReactNode {
    return <CheckboxWidget nodeKey={this.__key} />;
  }
}

export function $createCheckboxWidgetNode(label = "Item"): CheckboxWidgetNode {
  return new CheckboxWidgetNode(label);
}

export function $isCheckboxWidgetNode(
  node: LexicalNode | null | undefined,
): node is CheckboxWidgetNode {
  return node instanceof CheckboxWidgetNode;
}

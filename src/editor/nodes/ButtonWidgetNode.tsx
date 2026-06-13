import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { useAppModal } from "../../modal/AppModalContext";
import {
  DEFAULT_BUTTON_CLICK_ACTION,
  executeButtonClick,
  normalizeButtonClickAction,
  type ButtonClickAction,
} from "../widgets/buttonActions";
import { WidgetShell } from "../widgets/WidgetShell";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedButtonWidgetNode = Spread<
  {
    clickAction: ButtonClickAction;
    confirmed: boolean;
    label: string;
    type: "button-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useButtonWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [label, setLabel] = useState("Action");
  const [confirmed, setConfirmed] = useState(false);
  const [clickAction, setClickAction] = useState<ButtonClickAction>(
    DEFAULT_BUTTON_CLICK_ACTION,
  );

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isButtonWidgetNode(node)) {
          setLabel(node.getLabel());
          setClickAction(node.getClickAction());
          setConfirmed(node.getConfirmed());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { clickAction, confirmed, label };
}

function ButtonWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const { label, clickAction, confirmed } = useButtonWidgetProps(nodeKey);
  const { showModal, showConfirm } = useAppModal();

  const handleClick = async () => {
    const result = await executeButtonClick(clickAction, { showModal, showConfirm });

    if (clickAction.type === "confirm" && result === true) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isButtonWidgetNode(node)) {
          node.setConfirmed(true);
        }
      });
    }
  };

  return (
    <WidgetShell nodeKey={nodeKey}>
      <button
        className={`widget-button-control${confirmed ? " is-confirmed" : ""}`}
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => void handleClick()}
      >
        {confirmed ? <span className="widget-button-check">✓</span> : null}
        {label}
      </button>
    </WidgetShell>
  );
}

export class ButtonWidgetNode extends BaseWidgetNode {
  __clickAction: ButtonClickAction;
  __confirmed: boolean;
  __label: string;

  static getType(): string {
    return "button-widget";
  }

  static clone(node: ButtonWidgetNode): ButtonWidgetNode {
    return new ButtonWidgetNode(
      node.__label,
      node.__clickAction,
      node.__confirmed,
      node.__key,
    );
  }

  constructor(
    label = "Action",
    clickAction: ButtonClickAction = DEFAULT_BUTTON_CLICK_ACTION,
    confirmed = false,
    key?: NodeKey,
  ) {
    super(key);
    this.__label = label;
    this.__clickAction = clickAction;
    this.__confirmed = confirmed;
  }

  static importJSON(serializedNode: SerializedButtonWidgetNode): ButtonWidgetNode {
    return new ButtonWidgetNode(
      serializedNode.label,
      normalizeButtonClickAction(
        serializedNode.clickAction ?? DEFAULT_BUTTON_CLICK_ACTION,
      ),
      serializedNode.confirmed ?? false,
    );
  }

  exportJSON(): SerializedButtonWidgetNode {
    return {
      ...super.exportJSON(),
      clickAction: this.__clickAction,
      confirmed: this.__confirmed,
      label: this.__label,
      type: "button-widget",
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

  getClickAction(): ButtonClickAction {
    return normalizeButtonClickAction(this.getLatest().__clickAction);
  }

  setClickAction(clickAction: ButtonClickAction): void {
    const self = this.getWritable();
    self.__clickAction = clickAction;
  }

  getConfirmed(): boolean {
    return this.getLatest().__confirmed;
  }

  setConfirmed(confirmed: boolean): void {
    const self = this.getWritable();
    self.__confirmed = confirmed;
  }

  createDOM(): HTMLElement {
    const span = super.createDOM();
    span.className = "widget-inline widget-button";
    return span;
  }

  decorate(): ReactNode {
    return <ButtonWidget nodeKey={this.__key} />;
  }
}

export function $createButtonWidgetNode(label = "Action"): ButtonWidgetNode {
  return new ButtonWidgetNode(label);
}

export function $isButtonWidgetNode(
  node: LexicalNode | null | undefined,
): node is ButtonWidgetNode {
  return node instanceof ButtonWidgetNode;
}

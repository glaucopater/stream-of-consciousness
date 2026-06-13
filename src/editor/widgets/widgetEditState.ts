import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { useEffect, useState } from "react";
import {
  $isButtonWidgetNode,
  type ButtonWidgetNode,
} from "../nodes/ButtonWidgetNode";
import {
  $isCheckboxWidgetNode,
  type CheckboxWidgetNode,
} from "../nodes/CheckboxWidgetNode";
import { $isDateWidgetNode } from "../nodes/DateWidgetNode";
import { $isImgWidgetNode, type ImgWidgetNode } from "../nodes/ImgWidgetNode";
import { $isInputWidgetNode, type InputWidgetNode } from "../nodes/InputWidgetNode";
import { $isLabelWidgetNode, type LabelWidgetNode } from "../nodes/LabelWidgetNode";
import {
  $isNumberWidgetNode,
  type NumberWidgetNode,
} from "../nodes/NumberWidgetNode";
import {
  $isSelectWidgetNode,
  type SelectWidgetNode,
} from "../nodes/SelectWidgetNode";
import { $isTagWidgetNode, type TagWidgetNode } from "../nodes/TagWidgetNode";
import { $isTimeWidgetNode } from "../nodes/TimeWidgetNode";
import type { ButtonClickAction } from "./buttonActions";

export type WidgetEditState =
  | {
      type: "button";
      label: string;
      clickAction: ButtonClickAction;
    }
  | {
      type: "checkbox";
      label: string;
    }
  | {
      type: "input";
      placeholder: string;
    }
  | {
      type: "label";
      text: string;
    }
  | {
      type: "img";
      alt: string;
      src: string;
    }
  | {
      type: "date";
    }
  | {
      type: "time";
    }
  | {
      type: "number";
      placeholder: string;
    }
  | {
      type: "select";
      optionsText: string;
    }
  | {
      type: "tag";
      text: string;
    };

function readButtonState(node: ButtonWidgetNode): WidgetEditState {
  return {
    type: "button",
    label: node.getLabel(),
    clickAction: node.getClickAction(),
  };
}

function readCheckboxState(node: CheckboxWidgetNode): WidgetEditState {
  return {
    type: "checkbox",
    label: node.getLabel(),
  };
}

function readInputState(node: InputWidgetNode): WidgetEditState {
  return {
    type: "input",
    placeholder: node.getPlaceholder(),
  };
}

function readLabelState(node: LabelWidgetNode): WidgetEditState {
  return {
    type: "label",
    text: node.getText(),
  };
}

function readImgState(node: ImgWidgetNode): WidgetEditState {
  return {
    type: "img",
    src: node.getSrc(),
    alt: node.getAlt(),
  };
}

function readDateState(): WidgetEditState {
  return { type: "date" };
}

function readTimeState(): WidgetEditState {
  return { type: "time" };
}

function readNumberState(node: NumberWidgetNode): WidgetEditState {
  return {
    type: "number",
    placeholder: node.getPlaceholder(),
  };
}

function readSelectState(node: SelectWidgetNode): WidgetEditState {
  return {
    type: "select",
    optionsText: node.getOptions().join("\n"),
  };
}

function readTagState(node: TagWidgetNode): WidgetEditState {
  return {
    type: "tag",
    text: node.getText(),
  };
}

export function useWidgetEditState(nodeKey: string | null): WidgetEditState | null {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<WidgetEditState | null>(null);

  useEffect(() => {
    if (!nodeKey) {
      setState(null);
      return;
    }

    const readState = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isButtonWidgetNode(node)) {
          setState(readButtonState(node));
          return;
        }
        if ($isCheckboxWidgetNode(node)) {
          setState(readCheckboxState(node));
          return;
        }
        if ($isInputWidgetNode(node)) {
          setState(readInputState(node));
          return;
        }
        if ($isLabelWidgetNode(node)) {
          setState(readLabelState(node));
          return;
        }
        if ($isImgWidgetNode(node)) {
          setState(readImgState(node));
          return;
        }
        if ($isDateWidgetNode(node)) {
          setState(readDateState());
          return;
        }
        if ($isTimeWidgetNode(node)) {
          setState(readTimeState());
          return;
        }
        if ($isNumberWidgetNode(node)) {
          setState(readNumberState(node));
          return;
        }
        if ($isSelectWidgetNode(node)) {
          setState(readSelectState(node));
          return;
        }
        if ($isTagWidgetNode(node)) {
          setState(readTagState(node));
          return;
        }
        setState(null);
      });
    };

    readState();
    return editor.registerUpdateListener(() => readState());
  }, [editor, nodeKey]);

  return state;
}

export function applyWidgetEditState(
  nodeKey: string,
  state: WidgetEditState,
): boolean {
  const node = $getNodeByKey(nodeKey);
  if (!node) {
    return false;
  }

  switch (state.type) {
    case "button":
      if (!$isButtonWidgetNode(node)) {
        return false;
      }
      node.setLabel(state.label);
      node.setClickAction(state.clickAction);
      return true;
    case "checkbox":
      if (!$isCheckboxWidgetNode(node)) {
        return false;
      }
      node.setLabel(state.label);
      return true;
    case "input":
      if (!$isInputWidgetNode(node)) {
        return false;
      }
      node.setPlaceholder(state.placeholder);
      return true;
    case "label":
      if (!$isLabelWidgetNode(node)) {
        return false;
      }
      node.setText(state.text);
      return true;
    case "img":
      if (!$isImgWidgetNode(node)) {
        return false;
      }
      node.setSrc(state.src);
      node.setAlt(state.alt);
      return true;
    case "date":
      return $isDateWidgetNode(node);
    case "time":
      return $isTimeWidgetNode(node);
    case "number":
      if (!$isNumberWidgetNode(node)) {
        return false;
      }
      node.setPlaceholder(state.placeholder);
      return true;
    case "select":
      if (!$isSelectWidgetNode(node)) {
        return false;
      }
      node.setOptions(
        state.optionsText
          .split("\n")
          .map((option) => option.trim())
          .filter(Boolean),
      );
      return true;
    case "tag":
      if (!$isTagWidgetNode(node)) {
        return false;
      }
      node.setText(state.text);
      return true;
  }
}

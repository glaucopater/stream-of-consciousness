import type { Klass, LexicalNode } from "lexical";
import type { WidgetType } from "../widgets/registry";
import {
  $createButtonWidgetNode,
  ButtonWidgetNode,
} from "./ButtonWidgetNode";
import {
  $createCheckboxWidgetNode,
  CheckboxWidgetNode,
} from "./CheckboxWidgetNode";
import { $createDateWidgetNode, DateWidgetNode } from "./DateWidgetNode";
import { $createImgWidgetNode, ImgWidgetNode } from "./ImgWidgetNode";
import { $createInputWidgetNode, InputWidgetNode } from "./InputWidgetNode";
import { $createLabelWidgetNode, LabelWidgetNode } from "./LabelWidgetNode";
import {
  $createNumberWidgetNode,
  NumberWidgetNode,
} from "./NumberWidgetNode";
import {
  $createSelectWidgetNode,
  SelectWidgetNode,
} from "./SelectWidgetNode";
import { $createTagWidgetNode, TagWidgetNode } from "./TagWidgetNode";
import { $createTimeWidgetNode, TimeWidgetNode } from "./TimeWidgetNode";

export const widgetNodes: Array<Klass<LexicalNode>> = [
  ButtonWidgetNode,
  CheckboxWidgetNode,
  DateWidgetNode,
  ImgWidgetNode,
  InputWidgetNode,
  LabelWidgetNode,
  NumberWidgetNode,
  SelectWidgetNode,
  TagWidgetNode,
  TimeWidgetNode,
];

export function createWidgetNode(type: WidgetType): LexicalNode {
  switch (type) {
    case "button":
      return $createButtonWidgetNode();
    case "checkbox":
      return $createCheckboxWidgetNode();
    case "date":
      return $createDateWidgetNode();
    case "img":
      return $createImgWidgetNode();
    case "input":
      return $createInputWidgetNode();
    case "label":
      return $createLabelWidgetNode();
    case "number":
      return $createNumberWidgetNode();
    case "select":
      return $createSelectWidgetNode();
    case "tag":
      return $createTagWidgetNode();
    case "time":
      return $createTimeWidgetNode();
  }
}

export {
  ButtonWidgetNode,
  CheckboxWidgetNode,
  DateWidgetNode,
  ImgWidgetNode,
  InputWidgetNode,
  LabelWidgetNode,
  NumberWidgetNode,
  SelectWidgetNode,
  TagWidgetNode,
  TimeWidgetNode,
};

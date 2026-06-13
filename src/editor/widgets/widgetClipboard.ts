import type { LexicalNode, SerializedLexicalNode } from "lexical";
import { $getNodeByKey, $insertNodes, $isNodeSelection, $getSelection } from "lexical";
import {
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
} from "../nodes";
import { $isWidgetNode } from "../nodes/BaseWidgetNode";

const CLIPBOARD_PREFIX = "stream-of-consciousness:widget:";

export type WidgetClipboardPayload = SerializedLexicalNode & { type: string };

export function serializeWidgetNode(node: LexicalNode): WidgetClipboardPayload | null {
  if (!$isWidgetNode(node)) {
    return null;
  }
  return node.exportJSON() as WidgetClipboardPayload;
}

export function createWidgetFromPayload(
  payload: WidgetClipboardPayload,
): LexicalNode | null {
  switch (payload.type) {
    case "button-widget":
      return ButtonWidgetNode.importJSON(
        payload as Parameters<typeof ButtonWidgetNode.importJSON>[0],
      );
    case "checkbox-widget":
      return CheckboxWidgetNode.importJSON(
        payload as Parameters<typeof CheckboxWidgetNode.importJSON>[0],
      );
    case "input-widget":
      return InputWidgetNode.importJSON(
        payload as Parameters<typeof InputWidgetNode.importJSON>[0],
      );
    case "label-widget":
      return LabelWidgetNode.importJSON(
        payload as Parameters<typeof LabelWidgetNode.importJSON>[0],
      );
    case "img-widget":
      return ImgWidgetNode.importJSON(
        payload as Parameters<typeof ImgWidgetNode.importJSON>[0],
      );
    case "date-widget":
      return DateWidgetNode.importJSON(
        payload as Parameters<typeof DateWidgetNode.importJSON>[0],
      );
    case "time-widget":
      return TimeWidgetNode.importJSON(
        payload as Parameters<typeof TimeWidgetNode.importJSON>[0],
      );
    case "number-widget":
      return NumberWidgetNode.importJSON(
        payload as Parameters<typeof NumberWidgetNode.importJSON>[0],
      );
    case "select-widget":
      return SelectWidgetNode.importJSON(
        payload as Parameters<typeof SelectWidgetNode.importJSON>[0],
      );
    case "tag-widget":
      return TagWidgetNode.importJSON(
        payload as Parameters<typeof TagWidgetNode.importJSON>[0],
      );
    default:
      return null;
  }
}

export function encodeWidgetClipboard(payload: WidgetClipboardPayload): string {
  return CLIPBOARD_PREFIX + JSON.stringify(payload);
}

export function decodeWidgetClipboard(text: string): WidgetClipboardPayload | null {
  if (!text.startsWith(CLIPBOARD_PREFIX)) {
    return null;
  }

  try {
    const payload = JSON.parse(text.slice(CLIPBOARD_PREFIX.length)) as WidgetClipboardPayload;
    if (!payload?.type) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function copyWidgetNodeToClipboard(node: LexicalNode): Promise<boolean> {
  const payload = serializeWidgetNode(node);
  if (!payload || !navigator.clipboard?.writeText) {
    return false;
  }

  await navigator.clipboard.writeText(encodeWidgetClipboard(payload));
  return true;
}

export async function readWidgetFromClipboard(): Promise<WidgetClipboardPayload | null> {
  if (!navigator.clipboard?.readText) {
    return null;
  }

  const text = await navigator.clipboard.readText();
  return decodeWidgetClipboard(text);
}

export function insertWidgetNode(
  widgetNode: LexicalNode,
  afterNodeKey?: string | null,
) {
  if (afterNodeKey) {
    const anchorNode = $getNodeByKey(afterNodeKey);
    if (anchorNode) {
      anchorNode.insertAfter(widgetNode);
      widgetNode.selectNext();
      return;
    }
  }

  const selection = $getSelection();
  if ($isNodeSelection(selection) && selection.getNodes().length > 0) {
    const selectedNode = selection.getNodes()[0];
    selectedNode.insertAfter(widgetNode);
    widgetNode.selectNext();
    return;
  }

  $insertNodes([widgetNode]);
  widgetNode.selectNext();
}

export function getSelectedWidgetNode(): LexicalNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }

  const node = selection.getNodes()[0];
  return $isWidgetNode(node) ? node : null;
}

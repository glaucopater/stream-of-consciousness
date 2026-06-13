import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_HIGH,
  COPY_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";
import {
  createWidgetFromPayload,
  decodeWidgetClipboard,
  encodeWidgetClipboard,
  getSelectedWidgetNode,
  insertWidgetNode,
  serializeWidgetNode,
} from "../widgets/widgetClipboard";

export function WidgetClipboardPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      COPY_COMMAND,
      (event) => {
        const clipboardEvent = event as ClipboardEvent | null;
        let payloadText: string | null = null;

        editor.getEditorState().read(() => {
          const widgetNode = getSelectedWidgetNode();
          if (!widgetNode) {
            return;
          }

          const payload = serializeWidgetNode(widgetNode);
          if (payload) {
            payloadText = encodeWidgetClipboard(payload);
          }
        });

        if (!payloadText || !clipboardEvent?.clipboardData) {
          return false;
        }

        clipboardEvent.preventDefault();
        clipboardEvent.clipboardData.setData("text/plain", payloadText);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardEvent = event as ClipboardEvent | null;
        const text = clipboardEvent?.clipboardData?.getData("text/plain") ?? "";
        const payload = decodeWidgetClipboard(text);

        if (!payload) {
          return false;
        }

        const widgetNode = createWidgetFromPayload(payload);
        if (!widgetNode) {
          return false;
        }

        editor.update(() => {
          insertWidgetNode(widgetNode);
        });

        clipboardEvent?.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}

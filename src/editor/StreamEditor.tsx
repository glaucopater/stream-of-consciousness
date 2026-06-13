import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useEffect, useMemo } from "react";
import { widgetNodes } from "./nodes";
import { BlockStylePlugin } from "./plugins/BlockStylePlugin";
import { PersistencePlugin } from "./plugins/PersistencePlugin";
import { WidgetAutocompletePlugin } from "./plugins/WidgetAutocompletePlugin";
import { WidgetClipboardPlugin } from "./plugins/WidgetClipboardPlugin";
import { WidgetEditProvider } from "./widgets/WidgetEditContext";
import { editorTheme } from "./theme";

interface StreamEditorProps {
  initialContent: string;
  onSave: (serialized: string) => void;
  threadId: string;
}

function Placeholder() {
  return (
    <div className="stream-placeholder">
      Write an idea — try button, date, time, number, img…
    </div>
  );
}

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

export function StreamEditor({
  threadId,
  initialContent,
  onSave,
}: StreamEditorProps) {
  const editorConfig = useMemo(
    () => ({
      namespace: "stream-of-consciousness",
      nodes: widgetNodes,
      editorState: initialContent,
      onError(error: Error) {
        throw error;
      },
      theme: editorTheme,
    }),
    [threadId],
  );

  return (
    <LexicalComposer key={threadId} initialConfig={editorConfig}>
      <WidgetEditProvider>
        <div className="stream-editor">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="stream-content-editable" spellCheck />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <BlockStylePlugin />
          <WidgetAutocompletePlugin />
          <WidgetClipboardPlugin />
          <PersistencePlugin threadId={threadId} onSave={onSave} />
        </div>
      </WidgetEditProvider>
    </LexicalComposer>
  );
}

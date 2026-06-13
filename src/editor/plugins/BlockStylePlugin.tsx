import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function BlockStylePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerRootListener((rootElement, prevRootElement) => {
      if (prevRootElement) {
        prevRootElement.classList.remove("stream-editor-root");
      }
      if (rootElement) {
        rootElement.classList.add("stream-editor-root");
      }
    });
  }, [editor]);

  return null;
}

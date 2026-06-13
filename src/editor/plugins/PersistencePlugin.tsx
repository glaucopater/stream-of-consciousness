import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { useCallback, useEffect, useRef } from "react";

interface PersistencePluginProps {
  onSave: (serialized: string) => void;
  threadId: string;
}

export function PersistencePlugin({ threadId, onSave }: PersistencePluginProps) {
  const timeoutRef = useRef<number | null>(null);
  const threadIdRef = useRef(threadId);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      const savingThreadId = threadId;
      timeoutRef.current = window.setTimeout(() => {
        if (threadIdRef.current !== savingThreadId) {
          return;
        }
        onSave(JSON.stringify(editorState.toJSON()));
      }, 400);
    },
    [onSave, threadId],
  );

  return <OnChangePlugin ignoreSelectionChange onChange={handleChange} />;
}

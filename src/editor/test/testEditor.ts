import { createEditor, type LexicalEditor } from "lexical";
import { widgetNodes } from "../nodes";

export function createTestEditor(): LexicalEditor {
  return createEditor({ nodes: widgetNodes });
}

export function runInEditor<T>(fn: () => T): T {
  const editor = createTestEditor();
  let result!: T;
  editor.update(() => {
    result = fn();
  });
  return result;
}

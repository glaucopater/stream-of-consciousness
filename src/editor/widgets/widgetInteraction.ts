import type { MouseEvent, KeyboardEvent } from "react";

export function keepEditorFocusOut(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}

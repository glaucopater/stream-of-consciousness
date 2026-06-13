export type ButtonClickAction =
  | { type: "none" }
  | { type: "modal"; message: string }
  | { type: "confirm"; message: string }
  | { type: "url"; url: string };

/** @deprecated Legacy stored action — migrated to `modal` on read */
type LegacyAlertAction = { type: "alert"; message: string };

export const DEFAULT_BUTTON_CLICK_ACTION: ButtonClickAction = { type: "none" };

export function normalizeButtonClickAction(
  action: ButtonClickAction | LegacyAlertAction,
): ButtonClickAction {
  if (action.type === "alert") {
    return { type: "modal", message: action.message };
  }
  return action;
}

export interface ButtonClickHandlers {
  showConfirm: (message: string) => Promise<boolean>;
  showModal: (message: string) => Promise<void>;
}

export async function executeButtonClick(
  action: ButtonClickAction,
  handlers: ButtonClickHandlers,
): Promise<boolean | undefined> {
  const normalized = normalizeButtonClickAction(action);

  switch (normalized.type) {
    case "modal":
      await handlers.showModal(normalized.message);
      return undefined;
    case "confirm":
      return handlers.showConfirm(normalized.message);
    case "url":
      window.open(normalized.url, "_blank", "noopener,noreferrer");
      return undefined;
    case "none":
      return undefined;
  }
}

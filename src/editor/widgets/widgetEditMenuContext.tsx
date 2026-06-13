import { createContext, useContext } from "react";

interface WidgetEditMenuContextValue {
  openContextMenu: (nodeKey: string, x: number, y: number) => void;
}

const WidgetEditMenuContext = createContext<WidgetEditMenuContextValue | null>(null);

export function useWidgetEditMenu() {
  const context = useContext(WidgetEditMenuContext);
  if (!context) {
    throw new Error("useWidgetEditMenu must be used within WidgetEditProvider");
  }
  return context;
}

export { WidgetEditMenuContext };

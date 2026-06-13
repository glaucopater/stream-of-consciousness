import type { NodeKey } from "lexical";
import type { ReactNode } from "react";
import { useWidgetEditMenu } from "./widgetEditMenuContext";

interface WidgetShellProps {
  children: ReactNode;
  nodeKey: NodeKey;
}

export function WidgetShell({ children, nodeKey }: WidgetShellProps) {
  const { openContextMenu } = useWidgetEditMenu();

  return (
    <span
      className="widget-shell"
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openContextMenu(nodeKey, event.clientX, event.clientY);
      }}
    >
      {children}
    </span>
  );
}

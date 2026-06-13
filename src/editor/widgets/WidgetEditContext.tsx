import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ButtonClickAction } from "./buttonActions";
import {
  copyWidgetNodeToClipboard,
  createWidgetFromPayload,
  insertWidgetNode,
  readWidgetFromClipboard,
} from "./widgetClipboard";
import { applyWidgetEditState, useWidgetEditState, type WidgetEditState } from "./widgetEditState";
import { WidgetEditMenuContext } from "./widgetEditMenuContext";
import { $isWidgetNode } from "../nodes/BaseWidgetNode";

interface ContextMenuState {
  nodeKey: string;
  x: number;
  y: number;
}

interface WidgetEditContextValue {
  openContextMenu: (nodeKey: string, x: number, y: number) => void;
  closeContextMenu: () => void;
  openEditDialog: (nodeKey: string) => void;
  closeEditDialog: () => void;
}

const WidgetEditContext = createContext<WidgetEditContextValue | null>(null);

export function useWidgetEdit() {
  const context = useContext(WidgetEditContext);
  if (!context) {
    throw new Error("useWidgetEdit must be used within WidgetEditProvider");
  }
  return context;
}

function WidgetContextMenu({
  menu,
  onCopy,
  onPaste,
  onEdit,
  onClose,
  canPaste,
}: {
  menu: ContextMenuState;
  onCopy: () => void;
  onPaste: () => void;
  onEdit: () => void;
  onClose: () => void;
  canPaste: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="widget-context-menu"
      style={{ left: menu.x, top: menu.y }}
    >
      <button className="widget-context-menu-item" type="button" onClick={onEdit}>
        Edit widget
      </button>
      <button className="widget-context-menu-item" type="button" onClick={onCopy}>
        Copy widget
      </button>
      <button
        className="widget-context-menu-item"
        disabled={!canPaste}
        type="button"
        onClick={onPaste}
      >
        Paste widget
      </button>
    </div>
  );
}

function WidgetEditForm({
  state,
  onChange,
}: {
  state: WidgetEditState;
  onChange: (state: WidgetEditState) => void;
}) {
  switch (state.type) {
    case "button":
      return (
        <>
          <label className="widget-edit-field">
            <span>Label</span>
            <input
              type="text"
              value={state.label}
              onChange={(event) =>
                onChange({ ...state, label: event.target.value })
              }
            />
          </label>
          <label className="widget-edit-field">
            <span>On click</span>
            <select
              value={state.clickAction.type}
              onChange={(event) => {
                const type = event.target.value as ButtonClickAction["type"];
                if (type === "modal") {
                  onChange({
                    ...state,
                    clickAction: { type: "modal", message: "" },
                  });
                  return;
                }
                if (type === "confirm") {
                  onChange({
                    ...state,
                    clickAction: { type: "confirm", message: "" },
                  });
                  return;
                }
                if (type === "url") {
                  onChange({
                    ...state,
                    clickAction: { type: "url", url: "" },
                  });
                  return;
                }
                onChange({ ...state, clickAction: { type: "none" } });
              }}
            >
              <option value="none">Nothing</option>
              <option value="modal">Show modal</option>
              <option value="confirm">Confirm modal</option>
              <option value="url">Open URL</option>
            </select>
          </label>
          {state.clickAction.type === "modal" ? (
            <label className="widget-edit-field">
              <span>Message</span>
              <input
                type="text"
                value={state.clickAction.message}
                onChange={(event) =>
                  onChange({
                    ...state,
                    clickAction: {
                      type: "modal",
                      message: event.target.value,
                    },
                  })
                }
              />
            </label>
          ) : null}
          {state.clickAction.type === "confirm" ? (
            <label className="widget-edit-field">
              <span>Confirm message</span>
              <input
                type="text"
                value={state.clickAction.message}
                onChange={(event) =>
                  onChange({
                    ...state,
                    clickAction: {
                      type: "confirm",
                      message: event.target.value,
                    },
                  })
                }
              />
            </label>
          ) : null}
          {state.clickAction.type === "url" ? (
            <label className="widget-edit-field">
              <span>URL</span>
              <input
                type="url"
                value={state.clickAction.url}
                onChange={(event) =>
                  onChange({
                    ...state,
                    clickAction: { type: "url", url: event.target.value },
                  })
                }
              />
            </label>
          ) : null}
        </>
      );
    case "checkbox":
      return (
        <label className="widget-edit-field">
          <span>Label</span>
          <input
            type="text"
            value={state.label}
            onChange={(event) =>
              onChange({ ...state, label: event.target.value })
            }
          />
        </label>
      );
    case "input":
      return (
        <label className="widget-edit-field">
          <span>Placeholder</span>
          <input
            type="text"
            value={state.placeholder}
            onChange={(event) =>
              onChange({ ...state, placeholder: event.target.value })
            }
          />
        </label>
      );
    case "label":
      return (
        <label className="widget-edit-field">
          <span>Text</span>
          <input
            type="text"
            value={state.text}
            onChange={(event) => onChange({ ...state, text: event.target.value })}
          />
        </label>
      );
    case "img":
      return (
        <>
          <label className="widget-edit-field">
            <span>Image URL</span>
            <input
              type="url"
              value={state.src}
              onChange={(event) => onChange({ ...state, src: event.target.value })}
            />
          </label>
          <label className="widget-edit-field">
            <span>Alt text</span>
            <input
              type="text"
              value={state.alt}
              onChange={(event) => onChange({ ...state, alt: event.target.value })}
            />
          </label>
        </>
      );
    case "select":
      return (
        <label className="widget-edit-field">
          <span>Options (one per line)</span>
          <textarea
            rows={4}
            value={state.optionsText}
            onChange={(event) =>
              onChange({ ...state, optionsText: event.target.value })
            }
          />
        </label>
      );
    case "tag":
      return (
        <label className="widget-edit-field">
          <span>Text</span>
          <input
            type="text"
            value={state.text}
            onChange={(event) => onChange({ ...state, text: event.target.value })}
          />
        </label>
      );
    case "date":
    case "time":
      return (
        <p className="widget-edit-hint">Use the inline picker to set the value.</p>
      );
    case "number":
      return (
        <label className="widget-edit-field">
          <span>Placeholder</span>
          <input
            type="text"
            value={state.placeholder}
            onChange={(event) =>
              onChange({ ...state, placeholder: event.target.value })
            }
          />
        </label>
      );
  }
}

function WidgetEditDialog({
  nodeKey,
  onClose,
}: {
  nodeKey: string;
  onClose: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const initialState = useWidgetEditState(nodeKey);
  const [draft, setDraft] = useState<WidgetEditState | null>(null);

  useEffect(() => {
    if (initialState) {
      setDraft(initialState);
    }
  }, [initialState]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!draft) {
    return null;
  }

  const title =
    draft.type.charAt(0).toUpperCase() + draft.type.slice(1) + " widget";

  return (
    <div className="widget-edit-overlay" onMouseDown={onClose}>
      <div
        className="widget-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${title}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="widget-edit-header">
          <h2>{title}</h2>
          <button className="widget-edit-close" type="button" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="widget-edit-body">
          <WidgetEditForm state={draft} onChange={setDraft} />
        </div>
        <footer className="widget-edit-footer">
          <button className="widget-edit-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="widget-edit-save"
            type="button"
            onClick={() => {
              editor.update(() => {
                applyWidgetEditState(nodeKey, draft);
              });
              onClose();
            }}
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}

export function WidgetEditProvider({ children }: { children: React.ReactNode }) {
  const [editor] = useLexicalComposerContext();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [editNodeKey, setEditNodeKey] = useState<string | null>(null);
  const [canPaste, setCanPaste] = useState(false);

  const openContextMenu = useCallback((nodeKey: string, x: number, y: number) => {
    setEditNodeKey(null);
    setContextMenu({ nodeKey, x, y });
    void readWidgetFromClipboard().then((payload) => {
      setCanPaste(Boolean(payload));
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setCanPaste(false);
  }, []);

  const openEditDialog = useCallback((nodeKey: string) => {
    setContextMenu(null);
    setEditNodeKey(nodeKey);
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditNodeKey(null);
  }, []);

  const handleCopy = useCallback(() => {
    if (!contextMenu) {
      return;
    }

    editor.getEditorState().read(() => {
      const node = $getNodeByKey(contextMenu.nodeKey);
      if (node && $isWidgetNode(node)) {
        void copyWidgetNodeToClipboard(node);
      }
    });
    closeContextMenu();
  }, [closeContextMenu, contextMenu, editor]);

  const handlePaste = useCallback(() => {
    if (!contextMenu) {
      return;
    }

    const targetNodeKey = contextMenu.nodeKey;
    void readWidgetFromClipboard().then((payload) => {
      if (!payload) {
        return;
      }

      const widgetNode = createWidgetFromPayload(payload);
      if (!widgetNode) {
        return;
      }

      editor.update(() => {
        insertWidgetNode(widgetNode, targetNodeKey);
      });
    });
    closeContextMenu();
  }, [closeContextMenu, contextMenu, editor]);

  return (
    <WidgetEditMenuContext.Provider value={{ openContextMenu }}>
      <WidgetEditContext.Provider
        value={{
          openContextMenu,
          closeContextMenu,
          openEditDialog,
          closeEditDialog,
        }}
      >
        {children}
        {contextMenu ? (
          <WidgetContextMenu
            canPaste={canPaste}
            menu={contextMenu}
            onClose={closeContextMenu}
            onCopy={handleCopy}
            onEdit={() => openEditDialog(contextMenu.nodeKey)}
            onPaste={handlePaste}
          />
        ) : null}
        {editNodeKey ? (
          <WidgetEditDialog nodeKey={editNodeKey} onClose={closeEditDialog} />
        ) : null}
      </WidgetEditContext.Provider>
    </WidgetEditMenuContext.Provider>
  );
}

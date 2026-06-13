import { useState } from "react";
import type { Thread } from "../hooks/useThreads";

interface ThreadSidebarProps {
  activeThreadId: string;
  threads: Thread[];
  onCreateThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, title: string) => void;
  onSelectThread: (threadId: string) => void;
}

export function ThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onRenameThread,
  onDeleteThread,
}: ThreadSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <aside className="thread-sidebar">
      <div className="thread-sidebar-header">
        <h2>Threads</h2>
        <button className="thread-new-button" type="button" onClick={onCreateThread}>
          + New
        </button>
      </div>
      <ul className="thread-list">
        {threads.map((thread) => {
          const isActive = thread.id === activeThreadId;
          const isEditing = editingId === thread.id;

          return (
            <li key={thread.id} className={`thread-item${isActive ? " is-active" : ""}`}>
              {isEditing ? (
                <input
                  autoFocus
                  className="thread-rename-input"
                  value={draftTitle}
                  onBlur={() => {
                    onRenameThread(thread.id, draftTitle);
                    setEditingId(null);
                  }}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onRenameThread(thread.id, draftTitle);
                      setEditingId(null);
                    }
                    if (event.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                />
              ) : (
                <button
                  className="thread-select-button"
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  onDoubleClick={() => {
                    setEditingId(thread.id);
                    setDraftTitle(thread.title);
                  }}
                >
                  <span className="thread-title">{thread.title}</span>
                  <span className="thread-date">
                    {new Date(thread.updatedAt).toLocaleString()}
                  </span>
                </button>
              )}
              {threads.length > 1 ? (
                <button
                  aria-label={`Delete ${thread.title}`}
                  className="thread-delete-button"
                  type="button"
                  onClick={() => onDeleteThread(thread.id)}
                >
                  ×
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

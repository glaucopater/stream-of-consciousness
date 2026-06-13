import { AppModalProvider } from "./modal/AppModalContext";
import { AvailableTags } from "./components/AvailableTags";
import { ThreadSidebar } from "./components/ThreadSidebar";
import { StreamEditor } from "./editor/StreamEditor";
import { useThreads } from "./hooks/useThreads";

export default function App() {
  const {
    activeThread,
    threads,
    selectThread,
    createThread,
    removeThread,
    updateTitle,
    saveThreadContent,
  } = useThreads();

  return (
    <AppModalProvider>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Stream of Consciousness</h1>
          <p className="app-subtitle">
            Materialize ideas as you write — autocomplete widget words inline.
          </p>
          <AvailableTags />
        </header>
        <div className="app-body">
          <ThreadSidebar
            activeThreadId={activeThread.id}
            threads={threads}
            onCreateThread={createThread}
            onDeleteThread={removeThread}
            onRenameThread={updateTitle}
            onSelectThread={selectThread}
          />
          <main className="app-main">
            <StreamEditor
              key={activeThread.id}
              threadId={activeThread.id}
              initialContent={activeThread.content}
              onSave={(content) => saveThreadContent(activeThread.id, content)}
            />
          </main>
        </div>
      </div>
    </AppModalProvider>
  );
}

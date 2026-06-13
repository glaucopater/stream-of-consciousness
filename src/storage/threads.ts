const STORAGE_KEY = "stream-of-consciousness-threads";

export interface Thread {
  id: string;
  title: string;
  updatedAt: number;
  content: string;
}

interface ThreadsStore {
  activeThreadId: string;
  threads: Thread[];
  version: 1;
}

export type { ThreadsStore };

function createEmptyEditorState(): string {
  return JSON.stringify({
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  });
}

function createThread(title: string): Thread {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    updatedAt: now,
    content: createEmptyEditorState(),
  };
}

function createDefaultStore(): ThreadsStore {
  const thread = createThread("Thread 1");
  return {
    version: 1,
    activeThreadId: thread.id,
    threads: [thread],
  };
}

export function loadThreadsStore(): ThreadsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultStore();
    }

    const parsed = JSON.parse(raw) as ThreadsStore;
    if (!parsed.threads?.length || !parsed.activeThreadId) {
      return createDefaultStore();
    }

    return parsed;
  } catch {
    return createDefaultStore();
  }
}

export function saveThreadsStore(store: ThreadsStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getActiveThread(store: ThreadsStore): Thread {
  return (
    store.threads.find((thread) => thread.id === store.activeThreadId) ??
    store.threads[0]
  );
}

export function updateThreadContent(
  store: ThreadsStore,
  threadId: string,
  content: string,
): ThreadsStore {
  const now = Date.now();
  return {
    ...store,
    threads: store.threads.map((thread) =>
      thread.id === threadId
        ? { ...thread, content, updatedAt: now }
        : thread,
    ),
  };
}

export function setActiveThread(
  store: ThreadsStore,
  threadId: string,
): ThreadsStore {
  return { ...store, activeThreadId: threadId };
}

export function addThread(store: ThreadsStore): ThreadsStore {
  const thread = createThread(`Thread ${store.threads.length + 1}`);
  return {
    activeThreadId: thread.id,
    threads: [...store.threads, thread],
    version: 1,
  };
}

export function renameThread(
  store: ThreadsStore,
  threadId: string,
  title: string,
): ThreadsStore {
  return {
    ...store,
    threads: store.threads.map((thread) =>
      thread.id === threadId ? { ...thread, title: title.trim() || thread.title } : thread,
    ),
  };
}

export function deleteThread(
  store: ThreadsStore,
  threadId: string,
): ThreadsStore {
  if (store.threads.length <= 1) {
    return store;
  }

  const threads = store.threads.filter((thread) => thread.id !== threadId);
  const activeThreadId =
    store.activeThreadId === threadId ? threads[0].id : store.activeThreadId;

  return {
    ...store,
    activeThreadId,
    threads,
  };
}

export { createEmptyEditorState };

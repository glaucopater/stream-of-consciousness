import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addThread,
  deleteThread,
  getActiveThread,
  loadThreadsStore,
  renameThread,
  saveThreadsStore,
  setActiveThread,
  updateThreadContent,
  type Thread,
  type ThreadsStore,
} from "../storage/threads";

export function useThreads() {
  const [store, setStore] = useState<ThreadsStore>(() => loadThreadsStore());

  useEffect(() => {
    saveThreadsStore(store);
  }, [store]);

  const activeThread = useMemo(() => getActiveThread(store), [store]);

  const selectThread = useCallback((threadId: string) => {
    setStore((current) => setActiveThread(current, threadId));
  }, []);

  const createThread = useCallback(() => {
    setStore((current) => addThread(current));
  }, []);

  const removeThread = useCallback((threadId: string) => {
    setStore((current) => deleteThread(current, threadId));
  }, []);

  const updateTitle = useCallback((threadId: string, title: string) => {
    setStore((current) => renameThread(current, threadId, title));
  }, []);

  const saveThreadContent = useCallback((threadId: string, content: string) => {
    setStore((current) => updateThreadContent(current, threadId, content));
  }, []);

  return {
    activeThread,
    createThread,
    removeThread,
    saveThreadContent,
    selectThread,
    threads: store.threads,
    updateTitle,
  };
}

export type { Thread };

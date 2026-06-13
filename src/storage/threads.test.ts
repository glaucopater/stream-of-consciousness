import { beforeEach, describe, expect, it } from "vitest";
import {
  addThread,
  deleteThread,
  loadThreadsStore,
  renameThread,
  saveThreadsStore,
  setActiveThread,
  updateThreadContent,
} from "./threads";

const STORAGE_KEY = "stream-of-consciousness-threads";

describe("threads storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a default store when storage is empty", () => {
    const store = loadThreadsStore();
    expect(store.threads).toHaveLength(1);
    expect(store.activeThreadId).toBe(store.threads[0].id);
  });

  it("persists thread content updates", () => {
    const initial = loadThreadsStore();
    const threadId = initial.threads[0].id;
    const updated = updateThreadContent(initial, threadId, '{"root":{}}');

    saveThreadsStore(updated);
    const reloaded = loadThreadsStore();

    expect(reloaded.threads[0].content).toBe('{"root":{}}');
  });

  it("adds and switches threads", () => {
    const withSecond = addThread(loadThreadsStore());
    expect(withSecond.threads).toHaveLength(2);
    expect(withSecond.activeThreadId).toBe(withSecond.threads[1].id);

    const switched = setActiveThread(withSecond, withSecond.threads[0].id);
    expect(switched.activeThreadId).toBe(withSecond.threads[0].id);
  });

  it("renames and deletes threads while keeping one", () => {
    const store = addThread(loadThreadsStore());
    const targetId = store.threads[0].id;
    const renamed = renameThread(store, targetId, "Notes");
    expect(renamed.threads[0].title).toBe("Notes");

    const afterDelete = deleteThread(renamed, renamed.threads[1].id);
    expect(afterDelete.threads).toHaveLength(1);

    const cannotDeleteLast = deleteThread(afterDelete, afterDelete.threads[0].id);
    expect(cannotDeleteLast.threads).toHaveLength(1);
  });

  it("persists to localStorage when saved", () => {
    const store = loadThreadsStore();
    saveThreadsStore(store);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});

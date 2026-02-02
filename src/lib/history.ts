import { Couplet, HistoryEntry } from "./types";

const STORAGE_KEY = "couplet_history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(name: string, couplet: Couplet): HistoryEntry {
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    couplet,
    createdAt: Date.now(),
  };
  const history = getHistory();
  history.unshift(entry);
  // Keep at most 50 entries
  if (history.length > 50) history.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

import { Couplet, HistoryEntry, GroupedHistory, DailyStats, SystemType, SystemDailyStats, TextHistoryEntry } from "./types";

const STORAGE_KEY = "couplet_history";
const STATS_KEY = "couplet_daily_stats";
const SYSTEM_STATS_KEY = "system_daily_stats";
const FREE_GENERATION_LIMIT = 5; // 每周期免费次数
const EXPIRY_HOURS = 8; // 有效期（小时）
const MAX_HISTORY_FOR_PROMPT = 10;

// 获取今天的日期字符串
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// 检查是否已过期（8小时）
function isExpired(timestamp: number): boolean {
  const now = Date.now();
  const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000;
  return now - timestamp >= expiryMs;
}

// ========== 迁移逻辑 ==========

function migrateOldStats(): void {
  if (typeof window === "undefined") return;
  try {
    const migrated = localStorage.getItem("_stats_migrated");
    if (migrated) return;

    const oldRaw = localStorage.getItem(STATS_KEY);
    if (oldRaw) {
      const oldStats: DailyStats = JSON.parse(oldRaw);
      if (oldStats.count > 0 && oldStats.timestamp && !isExpired(oldStats.timestamp)) {
        const systemStats: SystemDailyStats = {
          name_couplet: { count: oldStats.count, timestamp: oldStats.timestamp },
        };
        localStorage.setItem(SYSTEM_STATS_KEY, JSON.stringify(systemStats));
      }
    }
    localStorage.setItem("_stats_migrated", "1");
  } catch {
    // ignore migration errors
  }
}

// ========== 每系统独立计数 ==========

function getAllSystemStats(): SystemDailyStats {
  if (typeof window === "undefined") return {};
  migrateOldStats();
  try {
    const raw = localStorage.getItem(SYSTEM_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSystemDailyStats(system: SystemType): { count: number; timestamp: number } {
  const all = getAllSystemStats();
  const entry = all[system];
  if (!entry) return { count: 0, timestamp: Date.now() };
  if (isExpired(entry.timestamp)) return { count: 0, timestamp: Date.now() };
  return entry;
}

export function incrementSystemCount(system: SystemType): void {
  const all = getAllSystemStats();
  const entry = all[system];
  const shouldReset = !entry || isExpired(entry.timestamp);

  all[system] = {
    count: shouldReset ? 1 : entry!.count + 1,
    timestamp: shouldReset ? Date.now() : entry!.timestamp,
  };
  localStorage.setItem(SYSTEM_STATS_KEY, JSON.stringify(all));
}

export function systemNeedsLock(system: SystemType): boolean {
  const stats = getSystemDailyStats(system);
  return stats.count >= FREE_GENERATION_LIMIT;
}

export function getSystemRemainingFree(system: SystemType): number {
  const stats = getSystemDailyStats(system);
  return Math.max(0, FREE_GENERATION_LIMIT - stats.count);
}

export function getSystemRemainingTime(system: SystemType): number {
  const stats = getSystemDailyStats(system);
  if (!stats.timestamp) return 0;
  const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000;
  const remaining = (stats.timestamp + expiryMs) - Date.now();
  return Math.max(0, remaining);
}

export function formatSystemRemainingTime(system: SystemType): string {
  const remaining = getSystemRemainingTime(system);
  if (remaining <= 0) return "已刷新";

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}小时${minutes}分钟后刷新`;
  }
  return `${minutes}分钟后刷新`;
}

// ========== 通用文本历史（系统3/4/5） ==========

function getTextHistoryKey(system: SystemType): string {
  return `history_${system}`;
}

function getMaxHistory(system: SystemType): number {
  return system === "riddle" ? 10 : 50;
}

export function getTextHistory(system: SystemType): TextHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getTextHistoryKey(system));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addTextHistory(entry: Omit<TextHistoryEntry, "id" | "createdAt">): TextHistoryEntry {
  const full: TextHistoryEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
  };
  const history = getTextHistory(entry.systemType);
  history.unshift(full);
  const max = getMaxHistory(entry.systemType);
  if (history.length > max) history.length = max;
  localStorage.setItem(getTextHistoryKey(entry.systemType), JSON.stringify(history));
  return full;
}

export function clearTextHistory(system: SystemType): void {
  localStorage.removeItem(getTextHistoryKey(system));
}

export function getRecentRiddlesForPrompt(): string[] {
  const history = getTextHistory("riddle");
  return history.slice(0, MAX_HISTORY_FOR_PROMPT).map(
    (e) => `谜面：${e.content}，谜底：${e.extra || ""}`
  );
}

// ========== 原有春联历史（系统1 & 系统2共用结构） ==========

// 系统2的历史 key
function getCoupletHistoryKey(system: SystemType): string {
  if (system === "family_couplet") return "history_family_couplet";
  return STORAGE_KEY; // name_couplet 使用原有 key
}

export function getHistory(system: SystemType = "name_couplet"): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getCoupletHistoryKey(system));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getGroupedHistory(system: SystemType = "name_couplet"): GroupedHistory {
  const history = getHistory(system);
  const grouped: GroupedHistory = {};

  for (const entry of history) {
    if (!grouped[entry.name]) {
      grouped[entry.name] = [];
    }
    grouped[entry.name].push(entry);
  }

  return grouped;
}

export function getHistoryByName(name: string, system: SystemType = "name_couplet"): HistoryEntry[] {
  const history = getHistory(system);
  return history.filter((entry) => entry.name === name);
}

export function getRecentHistoryForPrompt(name: string, system: SystemType = "name_couplet"): string[] {
  const nameHistory = getHistoryByName(name, system);
  const recentEntries = nameHistory.slice(0, MAX_HISTORY_FOR_PROMPT);

  return recentEntries.map(
    (entry) =>
      `上联：${entry.couplet.upper}，下联：${entry.couplet.lower}，横批：${entry.couplet.horizontal}`
  );
}

export function addToHistory(name: string, couplet: Couplet, system: SystemType = "name_couplet"): HistoryEntry {
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    couplet,
    createdAt: Date.now(),
  };
  const history = getHistory(system);
  history.unshift(entry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(getCoupletHistoryKey(system), JSON.stringify(history));

  // 更新该系统的生成计数
  incrementSystemCount(system);

  return entry;
}

export function clearHistory(system: SystemType = "name_couplet"): void {
  localStorage.removeItem(getCoupletHistoryKey(system));
}

export function clearHistoryByName(name: string, system: SystemType = "name_couplet"): void {
  const history = getHistory(system);
  const filtered = history.filter((entry) => entry.name !== name);
  localStorage.setItem(getCoupletHistoryKey(system), JSON.stringify(filtered));
}

// ========== 旧接口兼容（被 page.tsx 使用） ==========

export function getDailyStats(): DailyStats {
  const stats = getSystemDailyStats("name_couplet");
  return { date: getTodayString(), count: stats.count, timestamp: stats.timestamp };
}

export function getRemainingTime(): number {
  return getSystemRemainingTime("name_couplet");
}

export function formatRemainingTime(): string {
  return formatSystemRemainingTime("name_couplet");
}

export function needsToWatchAd(): boolean {
  return systemNeedsLock("name_couplet");
}

export function getRemainingFreeGenerations(): number {
  return getSystemRemainingFree("name_couplet");
}

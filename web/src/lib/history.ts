import { Couplet, HistoryEntry, GroupedHistory, DailyStats } from "./types";

const STORAGE_KEY = "couplet_history";
const STATS_KEY = "couplet_daily_stats";
const FREE_GENERATION_LIMIT = 3;
const MAX_HISTORY_FOR_PROMPT = 10;

// 获取今天的日期字符串
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// 获取所有历史记录
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 获取按名字分组的历史记录
export function getGroupedHistory(): GroupedHistory {
  const history = getHistory();
  const grouped: GroupedHistory = {};
  
  for (const entry of history) {
    if (!grouped[entry.name]) {
      grouped[entry.name] = [];
    }
    grouped[entry.name].push(entry);
  }
  
  return grouped;
}

// 获取某个名字的历史记录
export function getHistoryByName(name: string): HistoryEntry[] {
  const history = getHistory();
  return history.filter((entry) => entry.name === name);
}

// 获取某个名字最近 N 条历史记录（用于 system prompt 去重）
export function getRecentHistoryForPrompt(name: string): string[] {
  const nameHistory = getHistoryByName(name);
  const recentEntries = nameHistory.slice(0, MAX_HISTORY_FOR_PROMPT);
  
  return recentEntries.map(
    (entry) =>
      `上联：${entry.couplet.upper}，下联：${entry.couplet.lower}，横批：${entry.couplet.horizontal}`
  );
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
  
  // 更新每日生成计数
  incrementDailyCount();
  
  return entry;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 清空某个名字的历史记录
export function clearHistoryByName(name: string): void {
  const history = getHistory();
  const filtered = history.filter((entry) => entry.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// ========== 每日生成次数统计 ==========

// 获取每日统计
export function getDailyStats(): DailyStats {
  if (typeof window === "undefined") {
    return { date: getTodayString(), count: 0 };
  }
  
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return { date: getTodayString(), count: 0 };
    }
    
    const stats: DailyStats = JSON.parse(raw);
    
    // 如果不是今天的数据，重置
    if (stats.date !== getTodayString()) {
      return { date: getTodayString(), count: 0 };
    }
    
    return stats;
  } catch {
    return { date: getTodayString(), count: 0 };
  }
}

// 增加每日生成计数
function incrementDailyCount(): void {
  const stats = getDailyStats();
  const newStats: DailyStats = {
    date: getTodayString(),
    count: stats.date === getTodayString() ? stats.count + 1 : 1,
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
}

// 检查是否需要看广告
export function needsToWatchAd(): boolean {
  const stats = getDailyStats();
  return stats.count >= FREE_GENERATION_LIMIT;
}

// 获取剩余免费次数
export function getRemainingFreeGenerations(): number {
  const stats = getDailyStats();
  return Math.max(0, FREE_GENERATION_LIMIT - stats.count);
}

// 广告观看后授予额外次数（重置为0，相当于获得3次）
export function grantAdBonus(): void {
  const newStats: DailyStats = {
    date: getTodayString(),
    count: 0,
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
}

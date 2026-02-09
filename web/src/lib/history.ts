import { Couplet, HistoryEntry, GroupedHistory, DailyStats } from "./types";

const STORAGE_KEY = "couplet_history";
const STATS_KEY = "couplet_daily_stats";
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
  const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000; // 8小时转毫秒
  return now - timestamp >= expiryMs;
}

// 获取剩余时间（毫秒）
export function getRemainingTime(): number {
  const stats = getDailyStats();
  if (!stats.timestamp) return 0;
  const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000;
  const remaining = (stats.timestamp + expiryMs) - Date.now();
  return Math.max(0, remaining);
}

// 格式化剩余时间为 "X小时Y分钟后刷新" 格式
export function formatRemainingTime(): string {
  const remaining = getRemainingTime();
  if (remaining <= 0) return "已刷新";
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后刷新`;
  }
  return `${minutes}分钟后刷新`;
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

// ========== 生成次数统计（8小时有效期） ==========

// 获取生成次数统计
export function getDailyStats(): DailyStats {
  if (typeof window === "undefined") {
    return { date: getTodayString(), count: 0, timestamp: Date.now() };
  }
  
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return { date: getTodayString(), count: 0, timestamp: Date.now() };
    }
    
    const stats: DailyStats = JSON.parse(raw);
    
    // 兼容旧数据：如果没有 timestamp，添加当前时间
    if (!stats.timestamp) {
      stats.timestamp = Date.now();
    }
    
    // 如果已过期（8小时），重置次数
    if (isExpired(stats.timestamp)) {
      return { date: getTodayString(), count: 0, timestamp: Date.now() };
    }
    
    return stats;
  } catch {
    return { date: getTodayString(), count: 0, timestamp: Date.now() };
  }
}

// 增加生成计数
function incrementDailyCount(): void {
  const stats = getDailyStats();
  
  // 如果已过期或是新用户，重置计时器
  const shouldReset = !stats.timestamp || isExpired(stats.timestamp);
  
  const newStats: DailyStats = {
    date: getTodayString(),
    count: shouldReset ? 1 : stats.count + 1,
    timestamp: shouldReset ? Date.now() : stats.timestamp,
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

// 广告观看后授予额外次数（暂时禁用广告功能）
// export function grantAdBonus(): void {
//   const newStats: DailyStats = {
//     date: getTodayString(),
//     count: 0,
//     timestamp: Date.now(),
//   };
//   localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
// }

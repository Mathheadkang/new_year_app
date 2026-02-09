export type HidePosition = "head" | "middle" | "tail";

export type FontFamily = "default" | "zhengqing" | "liujianmaocao" | "mashanzheng" | "zhimangxing";

export interface GenerateRequest {
  name: string;
  position: HidePosition;
}

export interface Couplet {
  upper: string;
  lower: string;
  horizontal: string;
  position: HidePosition;
}

export interface HistoryEntry {
  id: string;
  name: string;
  couplet: Couplet;
  createdAt: number;
}

// 按名字分类的历史记录
export interface GroupedHistory {
  [name: string]: HistoryEntry[];
}

// 每日生成统计（用于广告限制）
export interface DailyStats {
  date: string; // YYYY-MM-DD 格式
  count: number;
}

// localStorage 存储结构
export interface StorageData {
  history: HistoryEntry[];
  dailyStats: DailyStats;
}

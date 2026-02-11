export type HidePosition = "head" | "middle" | "random";

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

// 生成次数统计（8小时有效期）
export interface DailyStats {
  date: string; // YYYY-MM-DD 格式 (保留用于兼容)
  count: number;
  timestamp: number; // 开始计时的时间戳
}

// localStorage 存储结构
export interface StorageData {
  history: HistoryEntry[];
  dailyStats: DailyStats;
}

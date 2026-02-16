export type HidePosition = "head" | "middle" | "random";

export type FontFamily = "default" | "zhengqing" | "liujianmaocao" | "mashanzheng" | "zhimangxing";

export type SystemType = "name_couplet" | "family_couplet" | "blessing" | "kinship" | "riddle";

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

// System 2: 亲属春联
export interface FamilyCoupletRequest {
  name1: string;
  name2: string;
  relationship: string;
}

// System 3: 祝福语
export interface BlessingResult {
  text: string;
}

// System 4: 亲戚关系
export interface KinshipResult {
  terms: string[];
  explanation: string;
}

// System 5: 灯谜
export interface RiddleResult {
  question: string;
  answer: string;
}

export interface HistoryEntry {
  id: string;
  name: string;
  couplet: Couplet;
  createdAt: number;
}

// 通用文本历史条目（用于系统3/4/5）
export interface TextHistoryEntry {
  id: string;
  systemType: SystemType;
  label: string;
  content: string;
  extra?: string;
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

// 各系统独立的计数结构
export interface SystemDailyStats {
  [systemType: string]: { count: number; timestamp: number };
}

// localStorage 存储结构
export interface StorageData {
  history: HistoryEntry[];
  dailyStats: DailyStats;
}

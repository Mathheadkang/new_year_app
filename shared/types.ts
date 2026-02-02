// shared/types.ts
// 共享的类型定义，供 web 和 miniprogram 使用

export type HidePosition = "head" | "middle" | "tail";

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

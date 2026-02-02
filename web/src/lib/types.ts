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

// 历史记录存储工具

export interface CoupletHistory {
  id: string;
  name: string;
  position: 'head' | 'middle' | 'tail';
  upper: string;
  lower: string;
  horizontal: string;
  timestamp: number;
}

const STORAGE_KEY = 'couplet_history';
const MAX_HISTORY = 50;

/**
 * 获取历史记录
 */
export function getHistory(): CoupletHistory[] {
  try {
    const data = wx.getStorageSync(STORAGE_KEY);
    return data || [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

/**
 * 保存新的对联到历史记录
 */
export function saveToHistory(item: Omit<CoupletHistory, 'id' | 'timestamp'>): void {
  try {
    const history = getHistory();
    const newItem: CoupletHistory = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    // 添加到开头
    history.unshift(newItem);
    
    // 限制历史记录数量
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }
    
    wx.setStorageSync(STORAGE_KEY, history);
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * 清空历史记录
 */
export function clearHistory(): void {
  try {
    wx.removeStorageSync(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

/**
 * 格式化时间戳
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

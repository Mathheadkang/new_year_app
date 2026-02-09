"use strict";
// 历史记录存储工具
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = getHistory;
exports.saveToHistory = saveToHistory;
exports.clearHistory = clearHistory;
exports.getHistoryByName = getHistoryByName;
exports.getRecentHistoryForPrompt = getRecentHistoryForPrompt;
exports.formatTime = formatTime;
const STORAGE_KEY = 'couplet_history';
const MAX_HISTORY = 50;
/**
 * 获取历史记录
 */
function getHistory() {
    try {
        const data = wx.getStorageSync(STORAGE_KEY);
        return data || [];
    }
    catch (error) {
        console.error('Failed to get history:', error);
        return [];
    }
}
/**
 * 保存新的对联到历史记录
 */
function saveToHistory(item) {
    try {
        const history = getHistory();
        const newItem = {
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
    }
    catch (error) {
        console.error('Failed to save history:', error);
    }
}
/**
 * 清空历史记录
 */
function clearHistory() {
    try {
        wx.removeStorageSync(STORAGE_KEY);
    }
    catch (error) {
        console.error('Failed to clear history:', error);
    }
}
/**
 * 获取某个名字的历史记录
 */
function getHistoryByName(name) {
    const history = getHistory();
    return history.filter(item => item.name === name);
}
/**
 * 获取某个名字最近N条历史记录（用于系统提示词去重）
 */
function getRecentHistoryForPrompt(name, maxCount = 10) {
    const nameHistory = getHistoryByName(name);
    const recentEntries = nameHistory.slice(0, maxCount);
    return recentEntries.map(entry => `上联：${entry.upper}，下联：${entry.lower}，横批：${entry.horizontal}`);
}
/**
 * 格式化时间戳
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

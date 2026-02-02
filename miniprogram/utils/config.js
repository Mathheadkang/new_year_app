"use strict";
// API 配置
// 在这里配置你的 Vercel 部署地址
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.API_BASE_URL = void 0;
exports.validateApiConfig = validateApiConfig;
/**
 * 配置你的 API 基础地址
 * 本地开发: http://localhost:3000
 * Vercel 部署后: https://your-app.vercel.app
 */
exports.API_BASE_URL = 'YOUR_VERCEL_URL_HERE'; // 👈 请在这里填写你的 Vercel 地址
/**
 * API 端点
 */
exports.API_ENDPOINTS = {
    generate: `${exports.API_BASE_URL}/api/generate`,
};
/**
 * 验证 API 配置
 */
function validateApiConfig() {
    if (!exports.API_BASE_URL || exports.API_BASE_URL === 'YOUR_VERCEL_URL_HERE') {
        return false;
    }
    return true;
}

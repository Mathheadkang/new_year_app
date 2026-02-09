// API 配置
// 在这里配置你的 Vercel 部署地址

/**
 * 配置你的 API 基础地址
 * 本地开发: http://localhost:3000
 * Vercel 部署后: https://your-app.vercel.app
 */
export const API_BASE_URL = 'https://2026newyear.com';  // 👈 请在这里填写你的 Vercel 地址

/**
 * API 端点
 */
export const API_ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
};

/**
 * 验证 API 配置
 */
export function validateApiConfig(): boolean {
  if (!API_BASE_URL || API_BASE_URL.includes('YOUR_VERCEL_URL_HERE')) {
    return false;
  }
  return true;
}

/**
 * 模型配置文件
 * 支持 DeepSeek 和 豆包(Doubao) 大模型
 */

export type ModelProvider = "deepseek" | "doubao";

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// 模型配置映射
const MODEL_CONFIGS: Record<ModelProvider, Omit<ModelConfig, "apiKey" | "model">> = {
  deepseek: {
    provider: "deepseek",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    maxTokens: 300,
    temperature: 0.9,
  },
  doubao: {
    provider: "doubao",
    // 豆包大模型 API 端点 (火山引擎)
    endpoint: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    maxTokens: 300,
    temperature: 0.9,
  },
};

/**
 * 获取模型 ID
 */
function getModelId(provider: ModelProvider): string {
  switch (provider) {
    case "deepseek":
      return process.env.DEEPSEEK_MODEL_ID || "deepseek-chat";
    case "doubao":
      // 豆包需要使用推理接入点 ID (endpoint ID)
      return process.env.DOUBAO_MODEL_ID || "doubao-pro-32k";
    default:
      return "deepseek-chat";
  }
}

/**
 * 获取当前激活的模型提供商
 * 默认使用 deepseek
 */
export function getActiveProvider(): ModelProvider {
  const provider = process.env.MODEL_PROVIDER as ModelProvider;
  if (provider && (provider === "deepseek" || provider === "doubao")) {
    return provider;
  }
  return "deepseek"; // 默认使用 deepseek
}

/**
 * 获取指定提供商的 API Key
 */
export function getApiKey(provider: ModelProvider): string | undefined {
  switch (provider) {
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;
    case "doubao":
      return process.env.DOUBAO_API_KEY;
    default:
      return undefined;
  }
}

/**
 * 获取完整的模型配置
 */
export function getModelConfig(provider?: ModelProvider): ModelConfig {
  const activeProvider = provider || getActiveProvider();
  const apiKey = getApiKey(activeProvider);

  if (!apiKey) {
    throw new Error(`API key not configured for provider: ${activeProvider}`);
  }

  const baseConfig = MODEL_CONFIGS[activeProvider];
  const model = getModelId(activeProvider);

  return {
    ...baseConfig,
    apiKey,
    model,
  };
}

/**
 * 调用大模型 API
 */
export async function callLLMApi(
  systemPrompt: string,
  userPrompt: string,
  provider?: ModelProvider
): Promise<string> {
  const config = getModelConfig(provider);

  const requestBody = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`${config.provider} API error:`, response.status, errText);
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response from AI");
  }

  return content;
}

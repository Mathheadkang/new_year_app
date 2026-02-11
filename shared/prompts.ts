// shared/prompts.ts
// 共享的 AI 提示词配置

import { HidePosition } from "./types";

const positionLabels: Record<HidePosition, string> = {
  head: "藏头",
  middle: "藏中",
  random: "随机",
};

const positionInstructions: Record<HidePosition, string> = {
  head: "将用户姓名的每个字依次作为上联和下联每句的第一个字（即藏头）。如果名字是两个字，第一个字是上联第一个字，第二个字是下联第一个字。如果名字是三个字，第一个字是上联第一个字，第二个字是下联第一个字，第三个字可藏在横批的第一个字。",
  middle: "将用户姓名的每个字依次隐藏在上联和下联每句的中间位置（即藏中）。如果名字是两个字，第一个字在上联的中间，第二个字在下联的中间。如果名字是三个字，第一个字是上联中间，第二个字是下联中间，第三个字可藏在横批任何位置。",
  random: "请自由选择藏字方式，可以是藏头、藏中、藏尾，或者混合使用不同的藏字方式。例如上联藏头、下联藏尾，或者每个字用不同的方式隐藏。请发挥创意，在保证对联质量的前提下，选择最自然、最工整的藏字位置。",
};

export function buildSystemPrompt(): string {
  return `你是一位精通中国传统文化的对联大师。你的任务是为用户创作2026丙午马年春节对联。

要求：
1. 对联必须对仗工整，平仄协调
2. 内容应体现春节喜庆祥和的氛围，可以融入马年元素（骏马奔腾、马到成功等）
3. 上联和下联字数相同（7字联为佳）
4. 横批为4个字
5. 严格按照用户指定的藏字方式将姓名嵌入对联中
6. 你必须只返回JSON格式，不要有任何其他文字

返回格式（纯JSON，不要markdown代码块）：
{"upper":"上联内容","lower":"下联内容","horizontal":"横批内容"}`;
}

export function buildUserPrompt(name: string, position: HidePosition): string {
  const label = positionLabels[position];
  const instruction = positionInstructions[position];

  return `请为"${name}"创作一副${label}春联。

${instruction}

姓名：${name}
藏字方式：${label}

请直接返回JSON，不要包含任何其他文字或代码块标记。`;
}

export { positionLabels, positionInstructions };

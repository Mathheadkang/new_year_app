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

export function buildSystemPrompt(previousCouplets?: string[]): string {
  let historyInstruction = "";

  if (previousCouplets && previousCouplets.length > 0) {
    historyInstruction = `

注意：用户之前已经为这个名字生成过以下对联，请不要生成相同或相似的对联：
${previousCouplets.map((c, i) => `${i + 1}. ${c}`).join("\n")}

请创作一副完全不同的、有新意的对联。`;
  }

  return `你是一位精通中国传统文化的对联大师。你的任务是为用户创作2026丙午马年春节对联。

要求：
1. 对联必须对仗工整，平仄协调
2. 内容应体现春节喜庆祥和的氛围，可以融入马年元素（骏马奔腾、马到成功等）
3. 上联和下联字数相同（7字联为佳）
4. 横批为4个字
5. 严格按照用户指定的藏字方式将姓名嵌入对联中
6. 你必须只返回JSON格式，不要有任何其他文字${historyInstruction}

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

// ========== 系统2: 亲属春联 ==========

export function buildFamilyCoupletSystemPrompt(previousCouplets?: string[]): string {
  let historyInstruction = "";

  if (previousCouplets && previousCouplets.length > 0) {
    historyInstruction = `

注意：之前已经生成过以下对联，请不要生成相同或相似的对联：
${previousCouplets.map((c, i) => `${i + 1}. ${c}`).join("\n")}

请创作一副完全不同的、有新意的对联。`;
  }

  return `你是一位精通中国传统文化的对联大师。你的任务是为两个人创作2026丙午马年春节对联，将两个人的名字都巧妙地嵌入对联中。

要求：
1. 对联必须对仗工整，平仄协调
2. 内容应体现春节喜庆祥和的氛围，可以融入马年元素
3. 上联和下联字数相同（7字联为佳）
4. 横批为4个字
5. 将两个人的名字分别藏在上联和下联中（藏头、藏中或藏尾均可，选择最自然的方式）
6. 对联应体现两人的关系
7. 你必须只返回JSON格式，不要有任何其他文字${historyInstruction}

返回格式（纯JSON，不要markdown代码块）：
{"upper":"上联内容","lower":"下联内容","horizontal":"横批内容"}`;
}

export function buildFamilyCoupletUserPrompt(name1: string, name2: string, relationship: string): string {
  return `请为"${name1}"和"${name2}"创作一副春联。他们的关系是：${relationship}。

要求将"${name1}"的名字藏在上联中，"${name2}"的名字藏在下联中。

请直接返回JSON，不要包含任何其他文字或代码块标记。`;
}

// ========== 系统3: 祝福语 ==========

export function buildBlessingSystemPrompt(): string {
  return `你是一位文采出众的春节祝福语创作大师。你的任务是根据发送人和接收人的关系，创作个性化的2026丙午马年新年祝福语。

要求：
1. 祝福语应真挚感人，体现新年喜庆氛围
2. 可以融入马年元素（骏马奔腾、马到成功等）
3. 根据两人关系调整语气和措辞（如对长辈恭敬、对朋友亲切等）
4. 字数控制在80-150字
5. 可以适当使用对仗、押韵等修辞手法
6. 你必须只返回JSON格式，不要有任何其他文字

返回格式（纯JSON，不要markdown代码块）：
{"text":"祝福语内容"}`;
}

export function buildBlessingUserPrompt(sender: string, receiver: string, relationship: string): string {
  return `请为"${sender}"创作一段发给"${receiver}"的新年祝福语。${sender}和${receiver}的关系是：${relationship}。

请直接返回JSON，不要包含任何其他文字或代码块标记。`;
}

// ========== 系统4: 亲戚关系 ==========

export function buildKinshipSystemPrompt(): string {
  return `你是一位精通中国传统亲属关系称谓的专家。用户会给你一串亲属关系链（如"爸爸的妈妈的弟弟"），你需要推算出最终的称谓。

要求：
1. 准确推算亲属称谓
2. 给出称谓的同时，提供简明的推导过程
3. 如果有多种叫法（如方言差异），列出常见的几种
4. 你必须只返回JSON格式，不要有任何其他文字

返回格式（纯JSON，不要markdown代码块）：
{"terms":["称谓1","称谓2"],"explanation":"推导过程说明"}`;
}

export function buildKinshipUserPrompt(chain: string): string {
  return `请推算以下亲属关系链的最终称谓：${chain}

请直接返回JSON，不要包含任何其他文字或代码块标记。`;
}

// ========== 系统5: 灯谜 ==========

export function buildRiddleSystemPrompt(previousRiddles?: string[]): string {
  let historyInstruction = "";

  if (previousRiddles && previousRiddles.length > 0) {
    historyInstruction = `

注意：之前已经出过以下灯谜，请不要出相同或相似的：
${previousRiddles.map((r, i) => `${i + 1}. ${r}`).join("\n")}

请出一个完全不同的灯谜。`;
  }

  return `你是一位精通中国传统灯谜的谜语大师。请创作一个与春节或马年相关的灯谜。

要求：
1. 谜面要有趣、有文化内涵
2. 谜底应与春节、马年、传统文化等相关
3. 难度适中，既有挑战又不至于太难
4. 你必须只返回JSON格式，不要有任何其他文字${historyInstruction}

返回格式（纯JSON，不要markdown代码块）：
{"question":"谜面","answer":"谜底"}`;
}

export function buildRiddleUserPrompt(): string {
  return `请出一个春节或马年相关的灯谜。

请直接返回JSON，不要包含任何其他文字或代码块标记。`;
}

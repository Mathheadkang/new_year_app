// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { name, position } = event

  // 验证参数
  if (!name || !position || !["head", "middle", "tail"].includes(position)) {
    return {
      error: "Invalid parameters: name and position (head/middle/tail) required"
    }
  }

  if (name.length < 1 || name.length > 4) {
    return {
      error: "Name must be 1-4 characters"
    }
  }

  // 构建提示词
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(name, position)

  try {
    // 调用 DeepSeek API
    // ⚠️ 请在云函数环境变量中配置 DEEPSEEK_API_KEY
    const apiKey = process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
      return {
        error: "API key not configured in cloud function"
      }
    }

    const response = await cloud.openapi.cloudbase.callFunction({
      action: 'fetch',
      data: {
        url: 'https://api.deepseek.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.9,
          max_tokens: 300
        })
      }
    })

    // 由于云函数限制，我们使用 wx-server-sdk 的 HTTP 请求
    // 实际实现中需要使用 node-fetch 或其他 HTTP 库
    const fetch = require('node-fetch')
    
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 300
      })
    })

    if (!apiResponse.ok) {
      return {
        error: 'Failed to generate couplet'
      }
    }

    const data = await apiResponse.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return {
        error: 'Empty response from AI'
      }
    }

    // 解析 JSON
    let jsonStr = content
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }

    const parsed = JSON.parse(jsonStr)

    return {
      upper: parsed.upper,
      lower: parsed.lower,
      horizontal: parsed.horizontal,
      position
    }

  } catch (error) {
    console.error('Generate error:', error)
    return {
      error: 'Failed to generate couplet: ' + error.message
    }
  }
}

// 构建系统提示词
function buildSystemPrompt() {
  return `你是一位精通中国传统文化的对联大师。你的任务是为用户创作2026丙午马年春节对联。

要求：
1. 对联必须对仗工整，平仄协调
2. 内容应体现春节喜庆祥和的氛围，可以融入马年元素（骏马奔腾、马到成功等）
3. 上联和下联字数相同（7字联为佳）
4. 横批为4个字
5. 严格按照用户指定的藏字方式将姓名嵌入对联中
6. 你必须只返回JSON格式，不要有任何其他文字

返回格式（纯JSON，不要markdown代码块）：
{"upper":"上联内容","lower":"下联内容","horizontal":"横批内容"}`
}

// 构建用户提示词
function buildUserPrompt(name, position) {
  const positionLabels = {
    head: "藏头",
    middle: "藏中",
    tail: "藏尾"
  }

  const positionInstructions = {
    head: "将用户姓名的每个字依次作为上联和下联每句的第一个字（即藏头）。如果名字是两个字，第一个字是上联第一个字，第二个字是下联第一个字。如果名字是三个字，第一个字是上联第一个字，第二个字是下联第一个字，第三个字可藏在横批的第一个字。",
    middle: "将用户姓名的每个字依次隐藏在上联和下联每句的中间位置（即藏中）。如果名字是两个字，第一个字在上联的中间，第二个字在下联的中间。如果名字是三个字，第一个字是上联中间，第二个字是下联中间，第三个字可藏在横批任何位置。",
    tail: "将用户姓名的每个字依次作为上联和下联每句的最后一个字（即藏尾）。如果名字是两个字，第一个字是上联最后一个字，第二个字是下联最后一个字。如果名字是三个字，第一个字是上联最后一个字，第二个字是下联最后一个字，第三个字可藏在横批任何位置。"
  }

  const label = positionLabels[position]
  const instruction = positionInstructions[position]

  return `请为"${name}"创作一副${label}春联。

${instruction}

姓名：${name}
藏字方式：${label}

请直接返回JSON，不要包含任何其他文字或代码块标记。`
}

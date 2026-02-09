import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { Couplet } from "@/lib/types";
import { callLLMApi, getActiveProvider, getApiKey } from "@/lib/modelConfig";

interface GenerateRequestBody {
  name: string;
  position: "head" | "middle" | "tail";
  previousCouplets?: string[];
}

export async function POST(request: NextRequest) {
  // 检查当前激活的模型是否配置了 API Key
  const activeProvider = getActiveProvider();
  const apiKey = getApiKey(activeProvider);
  
  if (!apiKey) {
    return NextResponse.json(
      { error: `API key not configured for provider: ${activeProvider}` },
      { status: 500 }
    );
  }

  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, position, previousCouplets } = body;
  if (!name || !position || !["head", "middle", "tail"].includes(position)) {
    return NextResponse.json(
      { error: "Invalid parameters: name and position (head/middle/tail) required" },
      { status: 400 }
    );
  }

  if (name.length < 1 || name.length > 4) {
    return NextResponse.json(
      { error: "Name must be 1-4 characters" },
      { status: 400 }
    );
  }

  try {
    const systemPrompt = buildSystemPrompt(previousCouplets);
    const userPrompt = buildUserPrompt(name, position);
    
    // 使用统一的 LLM API 调用函数
    const content = await callLLMApi(systemPrompt, userPrompt);

    // Parse JSON from the response, handling possible markdown code blocks
    let jsonStr = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    const couplet: Couplet = {
      upper: parsed.upper,
      lower: parsed.lower,
      horizontal: parsed.horizontal,
      position,
    };

    return NextResponse.json(couplet);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate couplet" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { GenerateRequest, Couplet } from "@/lib/types";

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, position } = body;
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
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: buildUserPrompt(name, position) },
          ],
          temperature: 0.9,
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      return NextResponse.json(
        { error: "Failed to generate couplet" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

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

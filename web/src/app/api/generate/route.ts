import { NextRequest, NextResponse } from "next/server";
import {
  buildSystemPrompt, buildUserPrompt,
  buildFamilyCoupletSystemPrompt, buildFamilyCoupletUserPrompt,
  buildBlessingSystemPrompt, buildBlessingUserPrompt,
  buildKinshipSystemPrompt, buildKinshipUserPrompt,
  buildRiddleSystemPrompt, buildRiddleUserPrompt,
} from "@/lib/prompts";
import { Couplet, SystemType } from "@/lib/types";
import { callLLMApi, getActiveProvider, getApiKey } from "@/lib/modelConfig";

interface GenerateRequestBody {
  system?: SystemType;
  // name_couplet
  name?: string;
  position?: "head" | "middle" | "random";
  previousCouplets?: string[];
  // family_couplet
  name1?: string;
  name2?: string;
  relationship?: string;
  // blessing
  sender?: string;
  receiver?: string;
  // kinship
  chain?: string;
  // riddle
  previousRiddles?: string[];
}

function parseJsonFromLLM(content: string): Record<string, unknown> {
  let jsonStr = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }
  return JSON.parse(jsonStr);
}

export async function POST(request: NextRequest) {
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

  const system: SystemType = body.system || "name_couplet";

  try {
    switch (system) {
      case "name_couplet": {
        const { name, position, previousCouplets } = body;
        if (!name || !position || !["head", "middle", "random"].includes(position)) {
          return NextResponse.json(
            { error: "Invalid parameters: name and position (head/middle/random) required" },
            { status: 400 }
          );
        }
        if (name.length < 1 || name.length > 4) {
          return NextResponse.json({ error: "Name must be 1-4 characters" }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(previousCouplets);
        const userPrompt = buildUserPrompt(name, position);
        const content = await callLLMApi(systemPrompt, userPrompt);
        const parsed = parseJsonFromLLM(content);

        const couplet: Couplet = {
          upper: parsed.upper as string,
          lower: parsed.lower as string,
          horizontal: parsed.horizontal as string,
          position,
        };
        return NextResponse.json(couplet);
      }

      case "family_couplet": {
        const { name1, name2, relationship, previousCouplets } = body;
        if (!name1 || !name2 || !relationship) {
          return NextResponse.json(
            { error: "name1, name2, and relationship are required" },
            { status: 400 }
          );
        }
        if (name1.length < 1 || name1.length > 4 || name2.length < 1 || name2.length > 4) {
          return NextResponse.json({ error: "Names must be 1-4 characters" }, { status: 400 });
        }

        const systemPrompt = buildFamilyCoupletSystemPrompt(previousCouplets);
        const userPrompt = buildFamilyCoupletUserPrompt(name1, name2, relationship);
        const content = await callLLMApi(systemPrompt, userPrompt);
        const parsed = parseJsonFromLLM(content);

        const couplet: Couplet = {
          upper: parsed.upper as string,
          lower: parsed.lower as string,
          horizontal: parsed.horizontal as string,
          position: "random",
        };
        return NextResponse.json(couplet);
      }

      case "blessing": {
        const { sender, receiver, relationship } = body;
        if (!sender || !receiver || !relationship) {
          return NextResponse.json(
            { error: "sender, receiver, and relationship are required" },
            { status: 400 }
          );
        }

        const systemPrompt = buildBlessingSystemPrompt();
        const userPrompt = buildBlessingUserPrompt(sender, receiver, relationship);
        const content = await callLLMApi(systemPrompt, userPrompt, undefined);
        const parsed = parseJsonFromLLM(content);

        return NextResponse.json({ text: parsed.text as string });
      }

      case "kinship": {
        const { chain } = body;
        if (!chain) {
          return NextResponse.json({ error: "chain is required" }, { status: 400 });
        }

        const systemPrompt = buildKinshipSystemPrompt();
        const userPrompt = buildKinshipUserPrompt(chain);
        const content = await callLLMApi(systemPrompt, userPrompt);
        const parsed = parseJsonFromLLM(content);

        return NextResponse.json({
          terms: parsed.terms as string[],
          explanation: parsed.explanation as string,
        });
      }

      case "riddle": {
        const { previousRiddles } = body;

        const systemPrompt = buildRiddleSystemPrompt(previousRiddles);
        const userPrompt = buildRiddleUserPrompt();
        const content = await callLLMApi(systemPrompt, userPrompt);
        const parsed = parseJsonFromLLM(content);

        return NextResponse.json({
          question: parsed.question as string,
          answer: parsed.answer as string,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown system type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}

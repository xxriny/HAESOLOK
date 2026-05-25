import { NextResponse } from "next/server";
import { MOCK_AI_GUIDE } from "@/data/mockAiGuide";
import { generateJsonWithLlm } from "@/services/llm/llmClient";
import { complaintGuideSystemPrompt } from "@/services/llm/prompts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await generateJsonWithLlm({
    systemPrompt: complaintGuideSystemPrompt,
    userPrompt: JSON.stringify(body),
    fallback: MOCK_AI_GUIDE,
  });

  return NextResponse.json(result);
}

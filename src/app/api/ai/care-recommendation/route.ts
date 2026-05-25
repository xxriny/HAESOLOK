import { NextResponse } from "next/server";
import { generateJsonWithLlm } from "@/services/llm/llmClient";
import { careRecommendationSystemPrompt } from "@/services/llm/prompts";
import { MOCK_CARE_RECOMMENDATION } from "@/services/llm/mockLlmFallback";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await generateJsonWithLlm({
    systemPrompt: careRecommendationSystemPrompt,
    userPrompt: JSON.stringify(body),
    fallback: MOCK_CARE_RECOMMENDATION,
  });

  return NextResponse.json(result);
}

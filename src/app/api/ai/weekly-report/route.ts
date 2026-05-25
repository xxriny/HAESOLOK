import { NextResponse } from "next/server";
import { MOCK_WEEKLY_REPORT } from "@/data/mockAiGuide";
import { generateJsonWithLlm } from "@/services/llm/llmClient";
import { weeklyReportSystemPrompt } from "@/services/llm/prompts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await generateJsonWithLlm({
    systemPrompt: weeklyReportSystemPrompt,
    userPrompt: JSON.stringify(body),
    fallback: MOCK_WEEKLY_REPORT,
  });

  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { MOCK_AI_GUIDE } from "@/data/mockAiGuide";
import { generateJsonWithLlm } from "@/services/llm/llmClient";
import { buildComplaintGuidePrompt } from "@/services/llm/prompts";
import { searchManual, formatRagContext } from "@/lib/manualSearch";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const complaint = body.latestComplaint;

  // ── RAG: 매뉴얼 검색 ────────────────────────────────────────────────────────
  // 민원 내용 + 메모 + 민원인 유형을 합쳐서 검색 쿼리 구성
  const searchQuery = [
    complaint?.content,
    complaint?.memo,
    complaint?.personType === "학부모" ? "학부모 민원" : "",
    complaint?.publicDataContext?.schedule,
  ]
    .filter(Boolean)
    .join(" ");

  const ragResults = await searchManual(searchQuery, 5);
  const ragContext = formatRagContext(ragResults);

  // ── LLM 호출 (RAG context 포함 프롬프트) ────────────────────────────────────
  const result = await generateJsonWithLlm({
    systemPrompt: buildComplaintGuidePrompt(ragContext),
    userPrompt: JSON.stringify(body),
    fallback: MOCK_AI_GUIDE,
  });

  return NextResponse.json(result);
}

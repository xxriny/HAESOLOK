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
  const formattedUserPrompt = `
[접수된 민원 정보]
- 발생 날짜: ${complaint?.date || "알 수 없음"}
- 발생 장소: ${complaint?.location || "알 수 없음"}
- 민원인 유형: ${complaint?.personType || "알 수 없음"}
- 민원 핵심 내용: ${complaint?.content || "내용 없음"}
- 관련 학사일정 유무: ${complaint?.academicScheduleRelated ? "예" : "아니오"}
- 추가 메모: ${complaint?.memo || "없음"}

[공공데이터 맥락]
- 소속 학교 급: ${complaint?.publicDataContext?.schoolLevel || "알 수 없음"}
- 관할 교육청: ${complaint?.publicDataContext?.region || "알 수 없음"}
- 오늘의 학사일정: ${complaint?.publicDataContext?.schedule || "없음"}

위 상황을 철저히 분석하여, 제시된 JSON 구조에 맞게 완벽한 맞춤형 대응 가이드를 작성해주세요. 절대로 다른 상황의 템플릿을 반복하지 마십시오.
  `;

  const result = await generateJsonWithLlm({
    systemPrompt: buildComplaintGuidePrompt(ragContext),
    userPrompt: formattedUserPrompt,
    fallback: MOCK_AI_GUIDE,
  });

  return NextResponse.json(result);
}

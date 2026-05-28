import { MOCK_AI_GUIDE, MOCK_WEEKLY_REPORT } from "@/data/mockAiGuide";

export const MOCK_CARE_RECOMMENDATION = {
  status: "support_needed" as const,
  headline: "지금은 짧은 회복 루틴을 먼저 챙겨볼 시기예요.",
  recommendations: [
    "5분 호흡 루틴으로 긴장을 낮추기",
    "민원 기록은 혼자 보관하지 말고 필요한 경우 관리자와 공유하기",
    "오늘 업무 종료 전 회복 시간을 일정에 고정하기",
  ],
  microCares: [
    {
      id: "mock-1",
      title: "마음 챙김 호흡",
      description: "눈을 감고 5분간 천천히 깊게 호흡하며 긴장을 풉니다.",
      durationMinutes: 5
    },
    {
      id: "mock-2",
      title: "긍정 확언 읽기",
      description: "스스로를 다독이는 긍정적인 문장을 3번 소리 내어 읽습니다.",
      durationMinutes: 3
    }
  ],
  disclaimer: "AI 케어 추천은 의료 진단이 아닌 셀프케어 참고 정보입니다.",
};

export function getFallbackByKind(kind: "complaint-guide" | "weekly-report" | "care-recommendation") {
  if (kind === "complaint-guide") return MOCK_AI_GUIDE;
  if (kind === "weekly-report") return MOCK_WEEKLY_REPORT;
  return MOCK_CARE_RECOMMENDATION;
}

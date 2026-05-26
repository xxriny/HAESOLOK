import { AIGuideResponse, AIWeeklyReportResponse } from "../types/ai";

export const MOCK_AI_GUIDE: AIGuideResponse = {
  classification: "생활지도 관련 민원",
  riskLevel: "보통",
  principles: [
    "감정적 대응을 자제하고 사실 중심으로 답변합니다.",
    "통화나 대면 상담 내용은 즉시 기록으로 남깁니다.",
    "교내 관리자 및 동료와 해당 상황을 공유합니다."
  ],
  draftResponse: "안녕하세요, 학부모님. 아이의 성장을 위해 보내주신 의견 감사합니다. 말씀하신 부분은 학교의 생활지도 규정과 아이의 상황을 고려하여 충분히 검토하겠습니다.",
  nextActions: [
    "상담 일시 및 핵심 내용 기록",
    "학교장 또는 교감에게 상황 보고",
    "추후 대면 상담 필요 여부 검토",
    "교권보호 지원 창구 확인"
  ],
  usedPublicData: [
    "나이스 학사일정",
    "학교알리미 학교 규모",
    "교육데이터맵 정책 키워드"
  ]
};

export const MOCK_WEEKLY_REPORT: AIWeeklyReportResponse = {
  summary: "이번 주에는 학부모 상담과 행정 업무가 겹치며 정서 온도가 지난주보다 0.6도 하락했습니다. 다행히 주말을 지나며 회복 신호가 보이고 있으니, 다음 주에는 나를 위한 5분 루틴을 조금 더 챙겨보세요.",
  recommendedCareType: "routine"
};

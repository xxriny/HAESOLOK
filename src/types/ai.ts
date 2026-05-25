export interface AIGuideResponse {
  classification: string;
  riskLevel: "낮음" | "보통" | "높음";
  principles: string[];
  draftResponse: string;
  nextActions: string[];
  usedPublicData: string[];
}

export interface AIWeeklyReportResponse {
  summary: string;
  recommendedCareType?: "breathing" | "quote" | "routine";
}

export interface AICareRecommendationResponse {
  status: "stable" | "caution" | "support_needed";
  headline: string;
  recommendations: string[];
  disclaimer: string;
}

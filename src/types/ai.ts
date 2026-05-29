export interface AIGuideResponse {
  classification: string;
  riskLevel: "low" | "medium" | "high";
  emotionEscalation?: "low" | "medium" | "high";
  summary?: string;
  principles: string[];
  basis?: string[];
  responsePlan?: string;
  draftResponse?: string;
  nextActions: string[];
  usedPublicData: string[];
}

export interface AIWeeklyReportResponse {
  summary: string;
  insight?: string;
  recommendation?: string;
  recommendedCareType?: "breathing" | "quote" | "routine";
}

export interface AICareRecommendationResponse {
  status: "stable" | "caution" | "support_needed";
  headline: string;
  recommendations: string[];
  microCares: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
  }[];
  disclaimer: string;
}

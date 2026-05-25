export type RiskStatus = "stable" | "caution" | "support_needed";

export interface CareContent {
  id: string;
  title: string;
  description: string;
  type: "breathing" | "quote" | "routine";
  durationMinutes: number;
}

export interface CounselingCenter {
  id: string;
  name: string;
  region: string;
  phone: string;
  description: string;
}

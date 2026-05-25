export type PersonType = "학부모" | "학생" | "외부인" | "기타";
export type ComplaintStatus = "기록됨" | "AI 가이드 생성됨";

export interface ComplaintRecord {
  id: string;
  date: string; // YYYY-MM-DD
  location: string;
  personType: PersonType;
  content: string;
  academicScheduleRelated: boolean;
  memo?: string;
  publicDataContext?: {
    schoolLevel: string;
    region: string;
    schedule: string;
    scale: string;
    policyKeywords: string[];
  };
  status: ComplaintStatus;
}

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
    region?: string;
    schoolName?: string;        // NEIS 학교명
    schedule: string;           // 학사일정 (NEIS 실시간 or Mock)
    scale: string;
    policyKeywords: string[];
    isRealSchedule?: boolean;   // 나이스 실시간 데이터 여부
  };
  status: ComplaintStatus;
}

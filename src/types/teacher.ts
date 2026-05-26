export type SchoolLevel = "초등학교" | "중학교" | "고등학교";
export type Region = "서울" | "경기" | "강원" | "부산" | "대구" | "기타";
export type TeacherRole = "담임" | "교과" | "비교과" | "관리자";

export interface TeacherProfile {
  schoolLevel: SchoolLevel;
  region: Region;
  role: TeacherRole;
  notificationTime: string; // e.g., "17:30"
  // NEIS 학교 정보 (온보딩에서 학교 검색 후 저장)
  schoolName?: string;           // 학교명 (SCHUL_NM)
  schoolCode?: string;           // 행정표준코드 (SD_SCHUL_CODE)
  educationOfficeCode?: string;  // 시도교육청코드 (ATPT_OFCDC_SC_CODE)
  educationOfficeName?: string;  // 시도교육청명 (ATPT_OFCDC_SC_NM)
  fondSc?: string;               // 공립/사립 (FOND_SC_NM)
}

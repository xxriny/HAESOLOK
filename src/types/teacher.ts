export type SchoolLevel = "초등학교" | "중학교" | "고등학교";
export type Region = "서울" | "경기" | "강원" | "부산" | "대구" | "기타";
export type TeacherRole = "담임" | "교과" | "비교과" | "관리자";

export interface TeacherProfile {
  schoolLevel: SchoolLevel;
  region: Region;
  role: TeacherRole;
  notificationTime: string; // e.g., "17:30"
}

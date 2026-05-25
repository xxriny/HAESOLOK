import { MOCK_PUBLIC_DATA } from "@/data/mockPublicData";

/**
 * 학교알리미 서비스
 * 다운로드 데이터 구조를 반영한 mock context를 반환합니다.
 */
export async function getSchoolInfoContext() {
  return {
    source: MOCK_PUBLIC_DATA.find((item) => item.id === "schoolinfo"),
    studentCount: 720,
    teacherCount: 42,
    schoolScale: "중대형 학교",
    studentPerTeacher: 17.1,
    environmentContext: "학교알리미 다운로드 데이터 기반의 학교 규모 및 교원당 학생 수 맥락입니다.",
  };
}

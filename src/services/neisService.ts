import { MOCK_PUBLIC_DATA } from "@/data/mockPublicData";

/**
 * 나이스 교육정보 개방포털 서비스
 * API Key가 있으면 실제 호출을 시도하고, 없으면 Mock 데이터를 반환합니다.
 */
export async function getNeisContext(date?: string) {
  const apiKey = process.env.NEIS_API_KEY;
  
  // API Key가 있는 경우 실제 호출 로직 (현재는 구조적 placeholder)
  if (apiKey) {
    try {
      // fetch("https://open.neis.go.kr/hub/schoolInfo?KEY=" + apiKey...)
    } catch (e) {
      console.error("NEIS API 호출 실패:", e);
    }
  }

  return {
    source: MOCK_PUBLIC_DATA.find((item) => item.id === "neis"),
    academicSchedule: date ? ["학부모 상담 주간", "기말고사 준비 기간"] : ["상시 학사일정 정보"],
    schoolInfo: "나이스 교육정보 개방포털에서 실시간 연동 가능한 학교기본정보 및 학사일정 컨텍스트입니다.",
  };
}

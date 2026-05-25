import { MOCK_PUBLIC_DATA } from "@/data/mockPublicData";

/**
 * KEDI 교육통계서비스
 * 비교군 정의용 통계 근거 mock context를 반환합니다.
 */
export async function getKediContext() {
  return {
    source: MOCK_PUBLIC_DATA.find((item) => item.id === "kedi"),
    comparisonGroup: "초등학교 / 강원 지역",
    nationalAverageContext: "KEDI 시계열 통계 자료로 정의된 학교급/지역별 비교군 정의 근거입니다.",
    notice: "KEDI는 마음 온도 원자료를 제공하지 않으며, 통계적 비교 기준을 정의하는 데만 활용됩니다.",
  };
}

import { MOCK_PUBLIC_DATA } from "@/data/mockPublicData";

/**
 * 교육데이터맵 서비스
 * 교육 정책/법령 키워드 mock metadata를 반환합니다.
 */
export async function getEducationDataMapContext() {
  return {
    source: MOCK_PUBLIC_DATA.find((item) => item.id === "datamap"),
    policyKeywords: ["생활지도", "교권보호", "학부모 민원 처리", "교육활동 침해 대응"],
    metadataContext: "교육데이터맵의 법령 및 정책 메타데이터를 기반으로 추출된 관련 키워드입니다.",
  };
}

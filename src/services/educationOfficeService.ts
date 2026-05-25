import { MOCK_COUNSELING_CENTERS } from "@/data/mockCareContents";

/**
 * 시도교육청 공개자료 서비스
 * 지역별 상담기관 및 교권보호 창구 mock 리스트를 반환합니다.
 */
export async function getEducationOfficeResources(region: string) {
  return {
    region,
    counselingCenters: MOCK_COUNSELING_CENTERS,
    officeNotice: `${region}교육청에서 제공하는 교권보호 및 상담 지원 창구 안내 리스트입니다.`,
  };
}

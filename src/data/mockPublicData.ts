import { PublicDataSource } from "../types/publicData";

export const MOCK_PUBLIC_DATA: PublicDataSource[] = [
  {
    id: "neis",
    name: "나이스 교육정보 개방포털",
    provider: "교육부",
    url: "https://open.neis.go.kr",
    usedFields: ["학교기본정보", "학사일정"],
    usage: "민원 기록 시 해당 학교의 학사일정 및 학교 정보를 자동 첨부하여 AI 대응 가이드의 맥락으로 활용합니다.",
    mvpImplementation: "API Key가 있으면 실시간 호출이 가능하도록 구조화되어 있으며, 현재는 시연을 위한 Mock 데이터를 함께 제공합니다.",
    futureUsage: "나이스 오픈 API를 통한 전국 학교 정보 및 실시간 학사일정 연동.",
    status: "api_possible"
  },
  {
    id: "schoolinfo",
    name: "학교알리미",
    provider: "한국교육학술정보원",
    url: "https://www.schoolinfo.go.kr",
    usedFields: ["학생 수", "교원 수", "학교 규모"],
    usage: "학교 규모 및 교원당 학생 수 데이터를 분석하여 교사의 업무 환경 맥락을 AI 가이드에 반영합니다.",
    mvpImplementation: "공개용 데이터 다운로드(CSV/XLS) 구조를 반영한 Mock 데이터로 시연합니다.",
    futureUsage: "공개용 공공데이터 최신 다운로드 자료를 정기적으로 업데이트하여 반영.",
    status: "download"
  },
  {
    id: "kedi",
    name: "교육통계서비스 (KESS)",
    provider: "한국교육개발원",
    url: "https://kess.kedi.re.kr",
    usedFields: ["교원현황 통계", "학교급별/지역별 통계"],
    usage: "학교급 및 지역별 비교군 정의를 위한 통계적 근거 데이터로 활용됩니다.",
    mvpImplementation: "KEDI 통계를 바탕으로 학교급별 마음 온도 비교군을 정의하였으며, 전국 평균 온도는 해소록 내부 지표로 생성합니다.",
    futureUsage: "KEDI 시계열 통계 자료와 해소록 정서 데이터를 결합한 심층 분석 리포트 제공.",
    status: "internal_metric"
  },
  {
    id: "edumap",
    name: "교육데이터맵",
    provider: "교육부",
    url: "https://data.edmgr.kr/datamap",
    usedFields: ["교육 정책", "법령 메타데이터"],
    usage: "민원 대응 가이드 생성 시 관련 교육 정책 및 법령 키워드를 근거로 제시합니다.",
    mvpImplementation: "키워드 기반의 Mock 메타데이터를 사용하여 대응 가이드의 정책적 근거를 시연합니다.",
    futureUsage: "교육데이터맵 API 연동을 통한 실시간 정책/법령 메타데이터 조회.",
    status: "example"
  },
  {
    id: "eduoffice",
    name: "시도교육청 공개자료",
    provider: "각 시도교육청",
    url: "",
    usedFields: ["교권보호 지원", "상담기관 정보"],
    usage: "교사의 지역에 맞는 상담 기관 및 교권보호 지원 창구 정보를 안내합니다.",
    mvpImplementation: "시도교육청 공개 자료를 기반으로 한 지역별 지원 기관 Mock 리스트를 제공합니다.",
    futureUsage: "전국 17개 시도교육청 지원 시스템과의 직접 연동 및 예약 기능 지원.",
    status: "example"
  }
];

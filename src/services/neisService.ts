import { MOCK_PUBLIC_DATA } from "@/data/mockPublicData";

const NEIS_BASE_URL = "https://open.neis.go.kr/hub";

/** 나이스 schoolInfo API 응답 row 타입 */
export interface NeisSchoolRow {
  ATPT_OFCDC_SC_CODE: string;  // 시도교육청코드
  ATPT_OFCDC_SC_NM: string;    // 시도교육청명
  SD_SCHUL_CODE: string;       // 행정표준코드
  SCHUL_NM: string;            // 학교명
  SCHUL_KND_SC_NM: string;     // 학교종류명 (초등학교/중학교/고등학교)
  LCTN_SC_NM: string;          // 시도명
  FOND_SC_NM: string;          // 설립명 (공립/사립)
  ORG_RDNMA: string;           // 도로명주소
}

/** 나이스 SchoolSchedule API 응답 row 타입 */
export interface NeisScheduleRow {
  AA_YMD: string;              // 학사일자 (YYYYMMDD)
  EVENT_NM: string;            // 행사명
  EVENT_CNTNT: string;         // 행사내용
  SBTR_DD_SC_NM: string;       // 수업공제일명 (수업일/휴업일/공휴일 등)
  ONE_GRADE_EVENT_YN: string;
  TW_GRADE_EVENT_YN: string;
  THREE_GRADE_EVENT_YN: string;
}

/**
 * 학교명으로 학교 검색 (schoolInfo API)
 * 서버에서만 호출 (API Key 보호)
 */
export async function searchSchools(
  schoolName: string,
  schoolLevel?: string
): Promise<NeisSchoolRow[]> {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    KEY: apiKey,
    Type: "json",
    pIndex: "1",
    pSize: "10",
    SCHUL_NM: schoolName,
  });
  if (schoolLevel) params.append("SCHUL_KND_SC_NM", schoolLevel);

  try {
    const res = await fetch(`${NEIS_BASE_URL}/schoolInfo?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();

    // 데이터 없을 때 RESULT만 반환되는 경우
    if (data.RESULT) return [];
    return data.schoolInfo?.[1]?.row ?? [];
  } catch {
    return [];
  }
}

/**
 * 특정 날짜의 학사일정 조회 (SchoolSchedule API)
 * 서버에서만 호출 (API Key 보호)
 */
export async function getSchoolSchedule(
  educationOfficeCode: string,
  schoolCode: string,
  date: string // YYYYMMDD
): Promise<NeisScheduleRow[]> {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) return getMockSchedule();

  const params = new URLSearchParams({
    KEY: apiKey,
    Type: "json",
    pIndex: "1",
    pSize: "20",
    ATPT_OFCDC_SC_CODE: educationOfficeCode,
    SD_SCHUL_CODE: schoolCode,
    AA_YMD: date,
  });

  try {
    const res = await fetch(`${NEIS_BASE_URL}/SchoolSchedule?${params.toString()}`);
    if (!res.ok) return getMockSchedule();
    const data = await res.json();

    if (data.RESULT) return []; // 해당 날짜 일정 없음
    return data.SchoolSchedule?.[1]?.row ?? [];
  } catch {
    return getMockSchedule();
  }
}

/**
 * 날짜 범위로 학사일정 조회 (이번 달 전체 등)
 */
export async function getSchoolScheduleRange(
  educationOfficeCode: string,
  schoolCode: string,
  fromDate: string, // YYYYMMDD
  toDate: string    // YYYYMMDD
): Promise<NeisScheduleRow[]> {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) return getMockSchedule();

  const params = new URLSearchParams({
    KEY: apiKey,
    Type: "json",
    pIndex: "1",
    pSize: "50",
    ATPT_OFCDC_SC_CODE: educationOfficeCode,
    SD_SCHUL_CODE: schoolCode,
    AA_FROM_YMD: fromDate,
    AA_TO_YMD: toDate,
  });

  try {
    const res = await fetch(`${NEIS_BASE_URL}/SchoolSchedule?${params.toString()}`);
    if (!res.ok) return getMockSchedule();
    const data = await res.json();

    if (data.RESULT) return [];
    return data.SchoolSchedule?.[1]?.row ?? [];
  } catch {
    return getMockSchedule();
  }
}

/**
 * AI 프롬프트에 주입할 NEIS 컨텍스트 생성
 */
export async function getNeisContext(
  educationOfficeCode?: string,
  schoolCode?: string,
  date?: string
) {
  // 학교 코드가 없으면 Mock 반환
  if (!educationOfficeCode || !schoolCode) {
    return {
      source: MOCK_PUBLIC_DATA.find((item) => item.id === "neis"),
      academicSchedule: ["상시 학사일정 정보 (학교 미등록)"],
      schoolInfo: "온보딩에서 학교를 등록하면 실제 학사일정이 제공됩니다.",
      isReal: false,
    };
  }

  const targetDate = date ?? new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rows = await getSchoolSchedule(educationOfficeCode, schoolCode, targetDate);

  const scheduleNames = rows.length > 0
    ? rows.map((r) => r.EVENT_NM).filter(Boolean)
    : ["오늘 등록된 학사 일정 없음"];

  return {
    source: MOCK_PUBLIC_DATA.find((item) => item.id === "neis"),
    academicSchedule: scheduleNames,
    schoolInfo: `나이스 실시간 학사일정 (${targetDate})`,
    isReal: true,
  };
}

/** API 키 없을 때 fallback Mock 학사일정 */
function getMockSchedule(): NeisScheduleRow[] {
  return [
    {
      AA_YMD: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
      EVENT_NM: "학부모 상담 주간",
      EVENT_CNTNT: "",
      SBTR_DD_SC_NM: "수업일",
      ONE_GRADE_EVENT_YN: "Y",
      TW_GRADE_EVENT_YN: "Y",
      THREE_GRADE_EVENT_YN: "Y",
    },
  ];
}

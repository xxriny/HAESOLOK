import { NextResponse } from "next/server";
import { getSchoolSchedule } from "@/services/neisService";

/**
 * POST /api/neis/schedule
 * 특정 날짜의 학사일정 조회
 * Body: { educationOfficeCode: string, schoolCode: string, date?: string (YYYYMMDD) }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { educationOfficeCode, schoolCode, date } = body;

    if (!educationOfficeCode || !schoolCode) {
      return NextResponse.json(
        { error: "시도교육청코드와 학교코드가 필요합니다." },
        { status: 400 }
      );
    }

    // date 없으면 오늘 날짜 사용 (YYYYMMDD)
    const targetDate =
      date ?? new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const rows = await getSchoolSchedule(educationOfficeCode, schoolCode, targetDate);

    return NextResponse.json({
      date: targetDate,
      schedules: rows,
      isEmpty: rows.length === 0,
    });
  } catch {
    return NextResponse.json(
      { error: "학사일정 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

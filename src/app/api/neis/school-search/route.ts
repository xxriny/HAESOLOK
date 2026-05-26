import { NextResponse } from "next/server";
import { searchSchools } from "@/services/neisService";

/**
 * POST /api/neis/school-search
 * 학교명으로 나이스 학교 목록 조회
 * Body: { schoolName: string, schoolLevel?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolName, schoolLevel } = body;

    if (!schoolName || schoolName.trim().length < 2) {
      return NextResponse.json(
        { error: "학교명을 2글자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    const rows = await searchSchools(schoolName.trim(), schoolLevel);

    return NextResponse.json({ schools: rows });
  } catch {
    return NextResponse.json(
      { error: "학교 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

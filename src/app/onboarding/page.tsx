"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/storage";
import { SchoolLevel, Region, TeacherRole, TeacherProfile } from "@/types/teacher";
import { NeisSchoolRow } from "@/services/neisService";
import { cn } from "@/lib/utils";
import { Search, CheckCircle, Loader } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  const [level, setLevel] = useState<SchoolLevel>("초등학교");
  const [region, setRegion] = useState<Region>("서울");
  const [role, setRole] = useState<TeacherRole>("담임");
  const [time, setTime] = useState("17:30");

  // 학교 검색 상태
  const [schoolQuery, setSchoolQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NeisSchoolRow[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<NeisSchoolRow | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async () => {
    if (schoolQuery.trim().length < 2) {
      setSearchError("학교명을 2글자 이상 입력해주세요.");
      return;
    }
    setSearchError("");
    setIsSearching(true);
    setSearchResults([]);
    setSelectedSchool(null);

    try {
      const res = await fetch("/api/neis/school-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName: schoolQuery, schoolLevel: level }),
      });
      const data = await res.json();
      if (data.schools && data.schools.length > 0) {
        setSearchResults(data.schools);
      } else {
        setSearchError("검색 결과가 없습니다. 학교명을 다시 확인해주세요.");
      }
    } catch {
      setSearchError("학교 검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSchool = (school: NeisSchoolRow) => {
    setSelectedSchool(school);
    setSearchResults([]);
    setSchoolQuery(school.SCHUL_NM);
  };

  const handleSave = () => {
    const profile: TeacherProfile = {
      schoolLevel: level,
      region,
      role,
      notificationTime: time,
      // NEIS 학교 정보 (선택한 경우에만)
      ...(selectedSchool && {
        schoolName: selectedSchool.SCHUL_NM,
        schoolCode: selectedSchool.SD_SCHUL_CODE,
        educationOfficeCode: selectedSchool.ATPT_OFCDC_SC_CODE,
        educationOfficeName: selectedSchool.ATPT_OFCDC_SC_NM,
        fondSc: selectedSchool.FOND_SC_NM,
      }),
    };
    saveProfile(profile);
    router.push("/dashboard");
  };

  return (
    <PageContainer>
      <AppHeader title="시작하기" showBack />

      <div className="p-4 space-y-6 pb-12">
        <div className="mb-2">
          <h2 className="text-xl font-bold mb-1 text-[#222222]">선생님, 반가워요!</h2>
          <p className="text-sm text-[#777777]">
            맞춤형 케어와 정확한 데이터 분석을 위해<br />기본 정보를 설정해주세요.
          </p>
        </div>

        <SoftCard className="space-y-6">
          {/* 학교급 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[#222222]">학교급</label>
            <div className="flex gap-2">
              {(["초등학교", "중학교", "고등학교"] as SchoolLevel[]).map(l => (
                <button
                  key={l}
                  onClick={() => {
                    setLevel(l);
                    setSelectedSchool(null);
                    setSearchResults([]);
                    setSchoolQuery("");
                  }}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all",
                    level === l
                      ? "bg-[#8EEA7A] border-[#8EEA7A] text-[#222222] shadow-sm"
                      : "bg-white border-[#E5F5E1] text-[#777777]"
                  )}
                >
                  {l.replace("학교", "")}
                </button>
              ))}
            </div>
          </div>

          {/* 학교 검색 (NEIS 연동) */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#222222]">
              학교 검색
              <span className="ml-1 text-xs font-normal text-[#58C85A]">나이스 연동</span>
            </label>
            <p className="text-[11px] text-[#999999] mb-2">
              학교를 등록하면 민원 기록 시 실제 학사일정이 자동으로 첨부됩니다.
            </p>

            {/* 선택된 학교 표시 */}
            {selectedSchool && (
              <div className="flex items-center gap-2 p-3 mb-2 rounded-xl bg-[#EFFFF0] border border-[#8EEA7A]">
                <CheckCircle size={16} className="text-[#58C85A] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#222222] truncate">{selectedSchool.SCHUL_NM}</p>
                  <p className="text-[11px] text-[#777777]">
                    {selectedSchool.ATPT_OFCDC_SC_NM} · {selectedSchool.FOND_SC_NM}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSchool(null);
                    setSchoolQuery("");
                  }}
                  className="text-xs text-[#999999] hover:text-[#555555]"
                >
                  변경
                </button>
              </div>
            )}

            {/* 검색 입력창 */}
            {!selectedSchool && (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={schoolQuery}
                    onChange={(e) => setSchoolQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={`예: 서울${level === "초등학교" ? "초" : level === "중학교" ? "중" : "고"}`}
                    className="flex-1 p-3 rounded-xl border border-[#E5F5E1] bg-white text-sm text-[#222222] outline-none focus:ring-1 focus:ring-[#8EEA7A]"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4 py-3 rounded-xl bg-[#222222] text-white text-sm font-medium hover:bg-[#333333] disabled:opacity-50 transition-all flex items-center gap-1"
                  >
                    {isSearching
                      ? <Loader size={15} className="animate-spin" />
                      : <Search size={15} />
                    }
                    검색
                  </button>
                </div>

                {/* 에러 메시지 */}
                {searchError && (
                  <p className="text-xs text-red-400 mt-1.5">{searchError}</p>
                )}

                {/* 검색 결과 목록 */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-[#E5F5E1] rounded-xl overflow-hidden">
                    {searchResults.map((school, i) => (
                      <button
                        key={school.SD_SCHUL_CODE}
                        onClick={() => handleSelectSchool(school)}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-[#F7FFF4] transition-colors",
                          i !== searchResults.length - 1 && "border-b border-[#E5F5E1]"
                        )}
                      >
                        <p className="text-sm font-semibold text-[#222222]">{school.SCHUL_NM}</p>
                        <p className="text-[11px] text-[#999999] mt-0.5">
                          {school.LCTN_SC_NM} · {school.ATPT_OFCDC_SC_NM} · {school.FOND_SC_NM}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[#222222]">지역</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full p-3 rounded-xl border border-[#E5F5E1] bg-white text-sm text-[#222222] focus:ring-1 focus:ring-[#8EEA7A] outline-none"
            >
              {(["서울", "경기", "강원", "부산", "대구", "기타"] as Region[]).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 담당 역할 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[#222222]">담당 역할</label>
            <div className="flex flex-wrap gap-2">
              {(["담임", "교과", "비교과", "관리자"] as TeacherRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    role === r
                      ? "bg-[#8EEA7A] border-[#8EEA7A] text-[#222222] shadow-sm"
                      : "bg-white border-[#E5F5E1] text-[#777777]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 알림 시간 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[#222222]">알림 설정 시간</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E5F5E1] bg-white text-sm text-[#222222] focus:ring-1 focus:ring-[#8EEA7A] outline-none"
            />
            <p className="text-[10px] text-[#999999] mt-2">
              * 퇴근 무렵 오늘의 온도를 기록할 수 있도록 알림을 보내드려요.
            </p>
          </div>
        </SoftCard>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#222222] text-white rounded-xl font-bold text-lg hover:bg-[#333333] transition-colors mt-4 shadow-md"
        >
          해소록 시작하기
        </button>

        <p className="text-center text-[10px] text-[#999999]">
          개인 온도 데이터는 익명화되어 통계 비교에만 사용됩니다.
        </p>
      </div>
    </PageContainer>
  );
}

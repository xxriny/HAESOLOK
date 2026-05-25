"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/storage";
import { SchoolLevel, Region, TeacherRole, TeacherProfile } from "@/types/teacher";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();

  const [level, setLevel] = useState<SchoolLevel>("초등학교");
  const [region, setRegion] = useState<Region>("서울");
  const [role, setRole] = useState<TeacherRole>("담임");
  const [time, setTime] = useState("17:30");

  const handleSave = () => {
    const profile: TeacherProfile = {
      schoolLevel: level,
      region,
      role,
      notificationTime: time,
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
          <div>
            <label className="block text-sm font-semibold mb-3 text-[#222222]">학교급</label>
            <div className="flex gap-2">
              {(["초등학교", "중학교", "고등학교"] as SchoolLevel[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
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

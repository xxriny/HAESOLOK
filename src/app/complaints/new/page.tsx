"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveComplaint, getProfile } from "@/lib/storage";
import { PersonType, ComplaintRecord } from "@/types/complaint";
import { TeacherProfile } from "@/types/teacher";
import { cn } from "@/lib/utils";
import { Info, CheckCircle } from "lucide-react";

export default function NewComplaintPage() {
  const router = useRouter();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [personType, setPersonType] = useState<PersonType>("학부모");
  const [content, setContent] = useState("");
  const [isScheduleRelated, setIsScheduleRelated] = useState(false);
  const [memo, setMemo] = useState("");

  // NEIS 연동 상태
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<string[]>([]);
  const [isScheduleReal, setIsScheduleReal] = useState(false);

  // 프로필 로드 + 오늘 학사일정 조회
  useEffect(() => {
    const savedProfile = getProfile();
    setProfile(savedProfile);

    if (savedProfile?.educationOfficeCode && savedProfile?.schoolCode) {
      const targetDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      fetch("/api/neis/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationOfficeCode: savedProfile.educationOfficeCode,
          schoolCode: savedProfile.schoolCode,
          date: targetDate,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.schedules && data.schedules.length > 0) {
            setTodaySchedules(data.schedules.map((s: { EVENT_NM: string }) => s.EVENT_NM));
            setIsScheduleReal(true);
          } else {
            setTodaySchedules(["오늘 등록된 학사 일정 없음"]);
            setIsScheduleReal(true);
          }
        })
        .catch(() => {
          setTodaySchedules(["학사일정 조회 실패 (Mock 데이터 사용)"]);
          setIsScheduleReal(false);
        });
    } else {
      // 학교 미등록 시 Mock
      setTodaySchedules(["학부모 상담 주간 (예시)"]);
      setIsScheduleReal(false);
    }
  }, []);

  const handleSubmit = () => {
    if (!content.trim()) return;

    const record: ComplaintRecord = {
      id: Date.now().toString(),
      date,
      location,
      personType,
      content,
      academicScheduleRelated: isScheduleRelated,
      memo,
      status: "기록됨",
      publicDataContext: {
        schoolLevel: profile?.schoolLevel ?? "초등학교",
        region: profile?.region,
        schoolName: profile?.schoolName,
        schedule: todaySchedules.join(", "),
        scale: "중대형 학교",
        policyKeywords: ["생활지도", "교권보호", "학부모 응대"],
        isRealSchedule: isScheduleReal,
      },
    };

    saveComplaint(record);
    router.push("/ai-guide");
  };

  return (
    <PageContainer>
      <AppHeader title="민원 기록" showBack />

      <div className="p-4 space-y-6 pb-32">
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-foreground">
            어떤 일이 있었나요?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            사실 중심으로 기록해주세요. AI가 적절한 대응 가이드를 생성해드립니다.
          </p>
        </div>

        <SoftCard className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-foreground mb-2">발생 날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-foreground mb-2">발생 장소</label>
              <input
                type="text"
                placeholder="예: 교무실, 전화 등"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2">민원인 유형</label>
            <div className="flex flex-wrap gap-2">
              {(["학부모", "학생", "기타"] as PersonType[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setPersonType(item)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                    personType === item
                      ? "bg-secondary border-primary text-primary shadow-sm"
                      : "bg-white border-border text-muted-foreground"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2">민원 핵심 내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="발생한 상황을 구체적으로 적어주세요."
              className="w-full p-4 rounded-xl border border-border bg-white text-sm min-h-[140px] resize-none outline-none focus:ring-1 focus:ring-primary placeholder:text-neutral-300"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isScheduleRelated}
              onChange={(e) => setIsScheduleRelated(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-foreground">특정 학사일정(시험, 상담 등)과 관련이 있나요?</span>
          </label>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2">추가 메모 (선택)</label>
            <input
              type="text"
              placeholder="증거 자료 유무나 참고 사항을 적어주세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </SoftCard>

        {/* 자동 첨부 공공데이터 맥락 */}
        <SoftCard className="bg-secondary border-border">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-primary" />
            <h3 className="font-bold text-foreground text-sm">자동 첨부되는 공공데이터 맥락</h3>
          </div>

          {/* 학사일정 (NEIS 실시간) */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              {isScheduleReal
                ? <CheckCircle size={12} className="text-primary" />
                : <Info size={12} className="text-muted-foreground" />
              }
              <span className="text-[11px] font-bold text-muted-foreground">
                오늘의 학사일정
                {isScheduleReal
                  ? <span className="ml-1 text-primary">(나이스 실시간)</span>
                  : <span className="ml-1 text-muted-foreground">(예시 데이터)</span>
                }
              </span>
            </div>
            <div className="pl-5 space-y-0.5">
              {todaySchedules.map((s, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">• {s}</p>
              ))}
            </div>
            {!isScheduleReal && (
              <p className="text-[10px] text-[#BBBBBB] mt-1 pl-5">
                온보딩에서 학교를 등록하면 실제 학사일정이 표시됩니다.
              </p>
            )}
          </div>

          <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc list-inside ml-1">
            <li>학교 규모 및 환경 현황 (학교알리미)</li>
            <li>관련 교육 정책 및 법령 가이드 (교육데이터맵)</li>
          </ul>
        </SoftCard>

        <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
          저장된 내용은 AI 민원 대응 가이드 생성을 위한<br />참고 정보로만 사용되며 외부로 유출되지 않습니다.
        </p>
      </div>

      <div className="sticky bottom-0 z-20 w-full p-4 bg-white border-t border-border mt-auto pb-8">
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary transition-all shadow-lg"
        >
          AI 대응 가이드 생성하기
        </button>
      </div>
    </PageContainer>
  );
}

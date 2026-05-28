"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { SoftCard } from "@/components/cards/SoftCard";
import { ExampleDataNotice } from "@/components/cards/ExampleDataNotice";
import { useRouter } from "next/navigation";
import { Heart, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { getProfile, getTemperatures, getComplaints } from "@/lib/storage";
import { useEffect, useState } from "react";
import { TeacherProfile } from "@/types/teacher";
import { detectRisk } from "@/lib/risk";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [riskStatus, setRiskStatus] = useState<string>("stable");
  const [avg7, setAvg7] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);

    const temps = getTemperatures();
    const complaints = getComplaints();
    const today = new Date().toISOString().split("T")[0];
    setHasCheckedIn(temps.some(t => t.date === today));

    const analysis = detectRisk(temps, complaints);
    setRiskStatus(analysis.status);
    setAvg7(analysis.avg7);
    if (analysis.avg7 !== null && analysis.prevAvg7 !== null) {
      setChange(analysis.avg7 - analysis.prevAvg7);
    }
  }, [router]);

  if (!profile) return null;

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "support_needed": return "지원 필요";
      case "caution": return "주의";
      default: return "안정";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "support_needed": return "text-red-600 bg-red-50 border-red-200";
      case "caution": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-emerald-600 bg-emerald-50 border-emerald-200";
    }
  };

  return (
    <PageContainer>
      <div className="p-5 pb-8 space-y-6">
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-foreground">
            선생님의 하루를<br />기록하고 지켜드릴게요.
          </h1>
        </div>

        {/* 1. Daily temperature check-in card */}
        <SoftCard className="bg-primary/20 border-none">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="text-primary" fill="#8EEA7A" />
            <h2 className="text-lg font-bold">오늘 내 온도 기록하기</h2>
          </div>
          {hasCheckedIn ? (
            <div className="text-sm font-medium text-foreground">오늘의 체크인이 완료되었습니다.</div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">지금 선생님의 마음 온도는 몇 도인가요?</p>
              <button
                onClick={() => router.push("/check-in")}
                className="w-full py-3 bg-white text-foreground rounded-xl font-bold text-sm shadow-sm border border-border"
              >
                30초 체크인 시작하기
              </button>
            </>
          )}
        </SoftCard>

        {/* 2. National teacher average comparison card */}
        <div className="relative">
          <SoftCard>
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-bold text-foreground">이번 주 {profile.schoolLevel} 전국 평균 온도</h2>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md font-bold">평균 36.4도</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              지금 전국적으로 마음 온도가 낮아지는 시기입니다. 선생님만 그런 게 아니니 안심하세요.
            </p>
            <ExampleDataNotice message="전국 평균 온도는 해소록 내부 지표이며, 현재는 예시 데이터입니다." />
          </SoftCard>
        </div>

        {/* 3. Care signal card */}
        <SoftCard className={cn("border", riskStatus !== "stable" ? "bg-amber-50/30" : "")}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className={cn(riskStatus === "stable" ? "text-emerald-500" : "text-amber-500")} size={18} />
              <h2 className="font-bold text-foreground">회복 신호 분석</h2>
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-md font-bold border", getStatusColor(riskStatus))}>
              {getStatusLabel(riskStatus)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {avg7 !== null ? `최근 7일 평균 온도는 ${avg7}도입니다. ` : "기록이 더 쌓이면 정확한 분석이 가능합니다. "}
            {change !== null && change < 0 ? `지난주 대비 ${Math.abs(change).toFixed(1)}도 하락했습니다.` : ""}
          </p>
        </SoftCard>

        {/* 4. micro-care card */}
        <SoftCard>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-primary" size={18} />
            <h2 className="font-bold text-foreground">오늘의 5분 케어 추천</h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 list-disc list-inside ml-4">
            <li>퇴근 전 5분 호흡 루틴</li>
            <li>짧은 마음 환기 글귀 읽기</li>
            <li>감정 정리 일기 쓰기</li>
          </ul>
          <button
            onClick={() => router.push("/care")}
            className="w-full py-2.5 bg-secondary text-primary rounded-xl font-bold text-sm hover:bg-secondary transition-colors"
          >
            5분 케어 시작하기
          </button>
        </SoftCard>

        {/* 5. Complaint response shortcut card */}
        <SoftCard>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="text-foreground" size={18} />
            <h2 className="font-bold text-foreground">민원 대응 가이드</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">기록된 민원 내용을 바탕으로 AI 대응 가이드를 생성합니다.</p>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/complaints/new")}
              className="flex-[2] py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              새 민원 기록하기
            </button>
            <button
              onClick={() => router.push("/complaints")}
              className="flex-1 py-2.5 border border-foreground text-foreground rounded-xl font-bold text-sm"
            >
              기록함 보기
            </button>
          </div>
        </SoftCard>

      </div>
    </PageContainer>
  );
}


"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { MOCK_WEEKLY_REPORT } from "@/data/mockAiGuide";
import { ExampleDataNotice } from "@/components/cards/ExampleDataNotice";
import { getComplaints, getTemperatures } from "@/lib/storage";
import { AIWeeklyReportResponse } from "@/types/ai";
import { Calendar, TrendingDown, Tag, Sparkles, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<AIWeeklyReportResponse>(MOCK_WEEKLY_REPORT);

  useEffect(() => {
    fetch("/api/ai/weekly-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temperatures: getTemperatures(), complaints: getComplaints() }),
    })
      .then((response) => (response.ok ? response.json() : MOCK_WEEKLY_REPORT))
      .then(setReport)
      .catch(() => setReport(MOCK_WEEKLY_REPORT));
  }, []);

  return (
    <PageContainer>
      <AppHeader title="주간 리포트" showBack />

      <div className="p-4 space-y-6 pb-24">
        <div>
          <h1 className="text-2xl font-bold text-[#222222] mb-2">
            이번 주 정서 리포트
          </h1>
          <p className="text-[#555555]">최근 7일간의 데이터를 분석한 결과입니다.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SoftCard className="bg-white">
            <div className="flex items-center gap-1.5 mb-2 text-[#777777]">
              <Calendar size={16} />
              <span className="text-[10px] font-bold">평균 온도</span>
            </div>
            <div className="text-2xl font-bold text-[#222222]">36.1도</div>
            <div className="flex items-center gap-1 mt-1 text-amber-500 text-[10px] font-bold">
              <TrendingDown size={14} />
              <span>지난주 대비 -0.6도</span>
            </div>
          </SoftCard>

          <SoftCard className="bg-white">
            <div className="flex items-center gap-1.5 mb-2 text-[#777777]">
              <Tag size={16} />
              <span className="text-[10px] font-bold">주요 키워드</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#222222] bg-[#F7FFF4] px-2 py-1 rounded inline-block w-fit">학부모 민원</span>
              <span className="text-[10px] font-bold text-[#222222] bg-neutral-50 px-2 py-1 rounded inline-block w-fit">행정업무</span>
            </div>
          </SoftCard>
        </div>

        <SoftCard className="border-[#8EEA7A] bg-[#EFFFF0]/50 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Sparkles size={18} className="text-[#58C85A]" />
            <h2 className="font-bold text-[#222222]">AI 주간 분석 요약</h2>
          </div>
          <p className="text-sm text-[#222222] leading-relaxed relative z-10 bg-white p-4 rounded-xl border border-[#E5F5E1] shadow-sm">
            {report.summary}
          </p>
          <div className="mt-4 flex justify-end relative z-10">
            <button 
              onClick={() => router.push("/care")} 
              className="text-xs font-bold text-white bg-[#222222] px-4 py-2 rounded-lg hover:bg-[#333333]"
            >
              추천 케어 시작하기
            </button>
          </div>
        </SoftCard>

        <SoftCard>
          <h3 className="font-bold text-[#222222] text-sm mb-3">전국 평균 비교</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <span className="text-xs text-[#555555]">전국 같은 학교급 평균</span>
              <span className="text-xs font-bold text-[#222222]">36.4도</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <span className="text-xs text-[#555555]">나의 이번 주 평균</span>
              <span className="text-xs font-bold text-[#58C85A]">36.1도</span>
            </div>
          </div>
        </SoftCard>

        <div className="space-y-3">
          <ExampleDataNotice message="전국 평균 데이터는 MVP 시연을 위한 예시 데이터입니다." />
          <div className="flex items-start gap-1.5 text-[10px] text-[#999999] px-1">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>
              AI 요약은 의료 진단이 아닌 정서 케어를 위한 참고용 인사이트입니다. 정확한 상태 파악은 전문가와의 상담을 권장합니다.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

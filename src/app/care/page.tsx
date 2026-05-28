"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { calculateRiskStatus } from "@/lib/risk";
import { getTemperatures, getComplaints } from "@/lib/storage";
import { useEffect, useState } from "react";
import { RiskStatus } from "@/types/care";
import { AICareRecommendationResponse } from "@/types/ai";
import { MOCK_COUNSELING_CENTERS } from "@/data/mockCareContents";
import { AlertCircle, CheckCircle2, ShieldAlert, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFallbackByKind } from "@/services/llm/mockLlmFallback";

export default function CarePage() {
  const [status, setStatus] = useState<RiskStatus>("stable");
  const [headline, setHeadline] = useState<string>("선생님의 마음은 지금 평온한 상태예요.");
  const [reasons, setReasons] = useState<string[]>([]);
  const [microCares, setMicroCares] = useState<AICareRecommendationResponse["microCares"]>([]);
  const [showCounseling, setShowCounseling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const temps = getTemperatures();
    const complaints = getComplaints();
    const localResult = calculateRiskStatus(temps, complaints);
    
    const fallback = getFallbackByKind("care-recommendation") as AICareRecommendationResponse;

    // Initial local fallback state
    setStatus(localResult.status);

    if (temps.length === 0 && complaints.length === 0) {
      setReasons(["최근 기록된 데이터가 없어 안정된 상태로 표시됩니다."]);
      setMicroCares(fallback.microCares);
      setIsLoading(false);
      return;
    }

    // Call LLM API
    fetch("/api/ai/care-recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temperatures: temps, complaints }),
    })
      .then((res) => res.json())
      .then((data: AICareRecommendationResponse) => {
        setStatus(data.status);
        setHeadline(data.headline);
        setReasons(data.recommendations);
        setMicroCares(data.microCares || fallback.microCares);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to local logic on error
        setStatus(localResult.status);
        setReasons(localResult.reasons.length > 0 ? localResult.reasons : ["최근 기록된 데이터에서 특이사항이 발견되지 않았습니다."]);
        setMicroCares(fallback.microCares);
        setIsLoading(false);
      });
  }, []);

  const StatusIcon = {
    stable: CheckCircle2,
    caution: AlertCircle,
    support_needed: ShieldAlert
  }[status];

  const statusLabel = {
    stable: "안정",
    caution: "주의",
    support_needed: "지원 필요"
  }[status];

  const statusColor = {
    stable: "text-primary bg-secondary border-border",
    caution: "text-amber-600 bg-amber-50 border-amber-200",
    support_needed: "text-rose-500 bg-rose-50 border-rose-200"
  }[status];

  return (
    <PageContainer>
      <AppHeader title="케어" />

      <div className="p-4 space-y-6 pb-24">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isLoading ? "분석 중..." : headline}
          </h1>
          <p className="text-muted-foreground">
            최근 선생님의 정서 기록을 바탕으로 분석한 맞춤형 케어 가이드입니다.
          </p>
        </div>

        {/* Current status card */}
        <SoftCard className={cn("flex items-start gap-4 border", statusColor)}>
          <div className={cn("p-3 rounded-full flex items-center justify-center", statusColor.split(" ")[0], statusColor.split(" ")[1])}>
            {isLoading ? <Loader2 size={28} className="animate-spin" /> : <StatusIcon size={28} />}
          </div>
          <div className="flex-1">
            <h2 className="text-sm text-muted-foreground font-medium mb-1">나의 현재 상태</h2>
            <div className="text-xl font-bold text-foreground mb-3">{statusLabel}</div>
            <div className="space-y-1.5">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">AI가 최근 데이터를 바탕으로 맞춤형 케어 가이드를 작성하고 있습니다...</div>
              ) : (
                reasons.map((r, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className={cn("mt-0.5", statusColor.split(" ")[0])}>•</span>
                    <span>{r}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </SoftCard>

        {/* Level 1 micro-care (Dynamic from LLM) */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3 px-1">지금 바로 할 수 있는 맞춤형 5분 케어</h2>
          <div className="grid gap-3">
            {isLoading ? (
              <SoftCard className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </SoftCard>
            ) : (
              microCares.map(care => (
                <SoftCard key={care.id} className="flex justify-between items-center group cursor-pointer hover:border-primary">
                  <div className="pr-4">
                    <h3 className="font-bold text-foreground text-sm mb-1">{care.title}</h3>
                    <p className="text-xs text-muted-foreground">{care.description}</p>
                  </div>
                  <div className="text-[10px] font-bold text-primary bg-secondary px-2 py-1 rounded-md shrink-0">
                    {care.durationMinutes}분
                  </div>
                </SoftCard>
              ))
            )}
          </div>
        </div>

        {/* Level 2 counseling support */}
        {(status === "support_needed" || status === "caution") && (
          <SoftCard className="border-accent bg-amber-50/30">
            <h3 className="font-bold text-foreground mb-2">전문가와의 상담이 필요하신가요?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              혼자 감당하기 버겁다면 전문 상담 기관의 도움을 받아보세요. 익명성이 보장되며 무료로 지원받을 수 있습니다.
            </p>
            {showCounseling ? (
              <div className="space-y-3 mt-4">
                {MOCK_COUNSELING_CENTERS.map(center => (
                  <div key={center.id} className="bg-white p-3 rounded-xl border border-border">
                    <h4 className="font-bold text-sm text-foreground">{center.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2 mt-0.5">{center.description}</p>
                    <a href={`tel:${center.phone}`} className="text-primary text-xs font-bold hover:underline">
                      상담 예약 및 기관 정보 보기
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCounseling(true)}
                  className="flex-[2] py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-sm"
                >
                  지역 상담 기관 보기
                </button>
                <button className="flex-1 py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl font-bold text-sm">
                  나중에 볼게요
                </button>
              </div>
            )}
          </SoftCard>
        )}

        <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground px-1 pt-4">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>
            해소록의 AI 요약과 케어 추천은 의료 진단이 아닌 셀프케어를 위한 참고 정보입니다. 심각한 정서적 위기 상황에서는 반드시 전문의의 진료를 받으시기 바랍니다.
          </p>
        </div>

      </div>
    </PageContainer>
  );
}

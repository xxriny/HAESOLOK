"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { MOCK_AI_GUIDE } from "@/data/mockAiGuide";
import { getComplaints } from "@/lib/storage";
import { AIGuideResponse } from "@/types/ai";
import { Info, ShieldCheck, AlertTriangle, CheckSquare, Database } from "lucide-react";
import { useEffect, useState } from "react";

export default function AIGuidePage() {
  const [guide, setGuide] = useState<AIGuideResponse>(MOCK_AI_GUIDE);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    const complaints = getComplaints();
    const latestComplaint = complaints[complaints.length - 1];

    if (!latestComplaint) {
      setGuide(MOCK_AI_GUIDE);
      setIsFallback(true);
      return;
    }

    fetch("/api/ai/complaint-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latestComplaint }),
    })
      .then((response) => (response.ok ? response.json() : MOCK_AI_GUIDE))
      .then((data) => {
        setGuide(data);
        setIsFallback(false);
      })
      .catch(() => {
        setGuide(MOCK_AI_GUIDE);
        setIsFallback(true);
      });
  }, []);

  const { classification, riskLevel, principles, draftResponse, nextActions, usedPublicData } = guide;

  return (
    <PageContainer className="bg-secondary">
      <AppHeader title="AI 민원 대응 가이드" showBack />

      <div className="p-4 space-y-6 pb-24">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white p-3 rounded-xl border border-border shadow-sm">
          <Info size={16} className="shrink-0 mt-0.5 text-primary" />
          <p className="leading-relaxed">
            본 결과는 참고용 대응 가이드이며 법률 자문이 아닙니다. 필요한 경우 관리자 보고 및 교권보호위원회 지원을 요청하십시오.
          </p>
        </div>

        {isFallback && (
          <div className="text-[10px] text-center text-muted-foreground bg-neutral-50 border border-neutral-200 rounded-lg py-2">
            현재 화면은 예시 데이터(Fallback)로 표시됩니다.
          </div>
        )}

        <div className="flex gap-3">
          <SoftCard className="flex-1 bg-white border-border py-3">
            <div className="text-[10px] text-muted-foreground font-bold mb-1">민원 유형</div>
            <div className="text-sm font-bold text-foreground">{classification}</div>
          </SoftCard>
          <SoftCard className="flex-1 bg-white border-border py-3">
            <div className="text-[10px] text-muted-foreground font-bold mb-1">대응 위험도</div>
            <div className="flex items-center gap-1">
              <AlertTriangle size={14} className="text-amber-500" />
              <div className="text-sm font-bold text-foreground">{riskLevel}</div>
            </div>
          </SoftCard>
        </div>

        <SoftCard>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="font-bold text-foreground">대응 원칙</h2>
          </div>
          <ul className="space-y-2">
            {principles.map((principle, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 font-bold">•</span>
                {principle}
              </li>
            ))}
          </ul>
        </SoftCard>

        <SoftCard className="border-primary bg-secondary/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <h2 className="font-bold text-foreground mb-3 ml-2">답변 초안 (참고용)</h2>
          <div className="bg-white p-4 rounded-xl text-sm text-foreground leading-relaxed border border-border ml-2">
            {draftResponse}
          </div>
        </SoftCard>

        <SoftCard>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={18} className="text-foreground" />
            <h2 className="font-bold text-foreground">다음 행동 체크리스트</h2>
          </div>
          <div className="space-y-3">
            {nextActions.map((action, index) => (
              <label key={index} className="flex items-start gap-3 cursor-pointer group">
                <input className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary" type="checkbox" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{action}</span>
              </label>
            ))}
          </div>
        </SoftCard>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Database size={16} className="text-muted-foreground" />
            <h3 className="font-bold text-sm text-muted-foreground">참고한 공공데이터 맥락</h3>
          </div>
          <div className="flex flex-wrap gap-2 px-1">
            {usedPublicData.map((data, index) => (
              <span key={index} className="text-[10px] bg-white border border-border text-muted-foreground px-2 py-1 rounded-md">
                {data}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

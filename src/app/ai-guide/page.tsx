"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { MOCK_AI_GUIDE } from "@/data/mockAiGuide";
import { getComplaints } from "@/lib/storage";
import { AIGuideResponse } from "@/types/ai";
import { Info, ShieldCheck, AlertTriangle, CheckSquare, Database, Bot, Sparkles, Copy, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "학부모님의 감정적 어휘나 고성 등 강압성 표현들을 객관적 서술로 정화하는 중입니다...",
  "교육부가 고시한 교원의 학생생활지도에 관한 행정 가이드라인 고시안을 매칭 대조 중입니다...",
  "사후 교권보호위원회 소집 및 법적 소명에 가장 유리한 팩트 중심 구조로 기록을 가공 중입니다...",
  "정중하면서도 법적으로 꼬투리를 전혀 잡히지 않는 완벽한 공적 통보 통지안을 작성하고 있습니다...",
  "잠시 마음의 무거움을 소록이에게 맡겨 두세요. 든든한 행정 방패가 될 자문서를 곧 출력합니다..."
];

export default function AIGuidePage() {
  const [guide, setGuide] = useState<AIGuideResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  
  // For smooth loading UX, force at least 3 seconds of loading
  const [fetchComplete, setFetchComplete] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // 1. Text Rolling Timer (4 seconds)
    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 4000);

    // 2. Minimum Loading Time (e.g., 6 seconds to show the cool UI)
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 6000);

    // 3. Fetch Data
    const complaints = getComplaints();
    const latestComplaint = complaints[complaints.length - 1];

    if (!latestComplaint) {
      setGuide(MOCK_AI_GUIDE);
      setFetchComplete(true);
    } else {
      fetch("/api/ai/complaint-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latestComplaint }),
      })
        .then((res) => (res.ok ? res.json() : MOCK_AI_GUIDE))
        .then((data) => {
          setGuide(data);
          setFetchComplete(true);
        })
        .catch(() => {
          setGuide(MOCK_AI_GUIDE);
          setFetchComplete(true);
        });
    }

    return () => {
      clearInterval(textInterval);
      clearTimeout(minTimer);
    };
  }, []);

  // When both fetch is complete and minimum time elapsed, transition to result
  useEffect(() => {
    if (fetchComplete && minTimeElapsed && guide) {
      setIsGenerating(false);
    }
  }, [fetchComplete, minTimeElapsed, guide]);

  const handleCopy = () => {
    if (guide?.responsePlan || guide?.draftResponse) {
      navigator.clipboard.writeText(guide.responsePlan ?? guide.draftResponse ?? "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // -------------------------------------------------------------
  // VIEW: LOADING STAGE
  // -------------------------------------------------------------
  if (isGenerating) {
    const progressPercent = Math.min(((loadingTextIndex + 1) / LOADING_MESSAGES.length) * 100, 100);
    const step = loadingTextIndex < 1 ? 1 : loadingTextIndex < 3 ? 2 : 3;

    return (
      <PageContainer className="bg-[#F9F9FB] flex flex-col justify-center">
        <AppHeader title="AI 분석 진행 중" />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
          
          {/* Mascot & Glowing Background */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Ping layer */}
            <div className="absolute inset-0 bg-[#8257E5]/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }} />
            {/* Spinning dashed ring layer */}
            <div className="absolute inset-2 border-2 border-dashed border-[#8257E5]/40 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            {/* Core Mascot */}
            <div className="relative z-10 w-24 h-24 bg-white rounded-full shadow-lg border border-[#EBE5FC] flex items-center justify-center">
              <Bot size={40} className="text-[#8257E5]" />
              <Sparkles size={16} className="absolute top-4 right-4 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Titles & Rolling Text */}
          <div className="text-center space-y-4 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8257E5]/10 rounded-full text-[#8257E5] text-xs font-bold mb-2">
              <Sparkles size={12} className="animate-pulse" />
              실시간 AI 교권 전용 분석망 가동
            </div>
            <h1 className="text-xl font-bold text-[#3D2D66]">
              AI가 전문 대응 가이드라인을<br/>집필하고 있습니다
            </h1>
            
            <div className="h-[60px] bg-white rounded-2xl border border-[#EBE5FC] p-4 flex items-center justify-center shadow-sm relative overflow-hidden transition-all">
               <p className="text-sm text-[#8372A6] text-center font-medium animate-in fade-in zoom-in duration-500 key={loadingTextIndex}">
                 {LOADING_MESSAGES[loadingTextIndex]}
               </p>
            </div>
            
            <p className="text-xs text-[#8372A6] px-4 leading-relaxed">
              분석 중에는 이 화면을 켜두어 주세요.<br/>잠시 숨을 고르는 동안 교육부 가이드를 철저히 해석한 법률 자문서를 완성해 드립니다.
            </p>
          </div>

          {/* Stepper & Progress Bar */}
          <div className="w-full space-y-4 mt-8">
            <div className="flex justify-between px-2 relative">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#EBE5FC] -z-10 -translate-y-1/2" />
              
              <div className="flex flex-col items-center gap-2 bg-[#F9F9FB]">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500", step >= 1 ? "bg-[#8257E5] text-white" : "bg-[#EBE5FC] text-[#8372A6]")}>1</div>
                <span className={cn("text-[10px] font-bold transition-colors", step >= 1 ? "text-[#8257E5]" : "text-[#8372A6]")}>감정 정제</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 bg-[#F9F9FB] px-2">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500", step >= 2 ? "bg-[#8257E5] text-white" : "bg-[#EBE5FC] text-[#8372A6]")}>2</div>
                <span className={cn("text-[10px] font-bold transition-colors", step >= 2 ? "text-[#8257E5]" : "text-[#8372A6]")}>법령 대조</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 bg-[#F9F9FB]">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500", step >= 3 ? "bg-[#8257E5] text-white" : "bg-[#EBE5FC] text-[#8372A6]")}>3</div>
                <span className={cn("text-[10px] font-bold transition-colors", step >= 3 ? "text-[#8257E5]" : "text-[#8372A6]")}>서안 작성</span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-[#EBE5FC] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#9F7AEA] to-[#8257E5] rounded-full transition-all duration-1000 ease-in-out" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // -------------------------------------------------------------
  // VIEW: RESULT STAGE (Administrative Report Style)
  // -------------------------------------------------------------
  if (!guide) return null;

  const { classification, riskLevel, summary, principles, nextActions, usedPublicData, basis } = guide;
  const responsePlan = guide.responsePlan ?? guide.draftResponse ?? "";

  return (
    <PageContainer className="bg-[#F6F2FF]">
      <AppHeader title="전문 대응 가이드라인" showBack />

      <div className="p-4 space-y-5 pb-24">
        
        {/* Header Notice */}
        <div className="flex items-start gap-2 text-[11px] text-[#8372A6] bg-white p-3 rounded-xl border border-[#EBE5FC] shadow-sm">
          <ShieldCheck size={16} className="shrink-0 mt-0.5 text-[#8257E5]" />
          <p className="leading-relaxed">
            본 가이드라인은 객관적 사실과 공공데이터를 기반으로 생성된 <strong>행정 참고용 자문서</strong>입니다. 법적 효력을 갖지 않으며, 심각한 사안은 반드시 교권보호위원회 지원을 요청하십시오.
          </p>
        </div>

        {/* 1. Neutralized Summary Card */}
        <SoftCard className="bg-white border-[#EBE5FC] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EBE5FC] pb-3">
            <div className="w-8 h-8 rounded-full bg-[#F6F2FF] flex items-center justify-center">
              <FileText size={16} className="text-[#8257E5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#3D2D66]">감정 배제 정제 사실 요약</h2>
              <p className="text-[10px] text-[#8372A6]">육하원칙 기반 객관적 사안 서술</p>
            </div>
          </div>
          <div className="text-sm text-[#3D2D66] leading-relaxed font-medium bg-[#F9F9FB] p-4 rounded-xl border border-neutral-100">
            {summary || "입력된 민원 내용을 기반으로 객관적인 사실 관계를 정리했습니다."}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 flex flex-col justify-center">
              <span className="text-[10px] text-[#8372A6] font-bold">민원 유형</span>
              <span className="text-xs font-bold text-[#3D2D66] mt-0.5">{classification}</span>
            </div>
            <div className="flex-1 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 flex flex-col justify-center">
              <span className="text-[10px] text-[#8372A6] font-bold">대응 위험도</span>
              <div className="flex items-center gap-1 mt-0.5">
                <AlertTriangle size={12} className={riskLevel === "high" ? "text-rose-500" : "text-amber-500"} />
                <span className="text-xs font-bold text-[#3D2D66]">{riskLevel}</span>
              </div>
            </div>
          </div>
        </SoftCard>

        {/* 2. Legal & Policy References */}
        {(basis && basis.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Database size={16} className="text-[#8372A6]" />
              <h3 className="font-bold text-sm text-[#3D2D66]">교육부 고시 및 판단 근거</h3>
            </div>
            <div className="bg-white rounded-2xl border border-[#EBE5FC] shadow-sm overflow-hidden">
              {basis.map((item, index) => (
                <div key={index} className={cn("p-4 border-l-4 border-l-[#8257E5] flex items-start gap-3", index !== basis.length - 1 && "border-b border-[#EBE5FC]")}>
                  <div className="w-5 h-5 rounded-full bg-[#F6F2FF] text-[#8257E5] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-[#3D2D66] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Action Recommendations (Checklist) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <CheckSquare size={16} className="text-[#8372A6]" />
            <h3 className="font-bold text-sm text-[#3D2D66]">선생님 맞춤형 실천 지침</h3>
          </div>
          <SoftCard className="bg-white border-[#EBE5FC] p-4 shadow-sm">
            <div className="space-y-3">
              {[...principles, ...nextActions].filter((v,i,a)=>a.indexOf(v)===i).map((action, index) => (
                <label key={index} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-[#F6F2FF] rounded-lg transition-colors">
                  <input className="mt-1 w-4 h-4 rounded border-[#EBE5FC] text-[#8257E5] focus:ring-[#8257E5]" type="checkbox" />
                  <span className="text-sm text-[#3D2D66] font-medium leading-relaxed select-none">{action}</span>
                </label>
              ))}
            </div>
          </SoftCard>
        </div>

        {/* 4. Copyable Response Draft */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-[#8372A6]" />
              <h3 className="font-bold text-sm text-[#3D2D66]">답변 템플릿 초안</h3>
            </div>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-white text-[#8257E5] px-3 py-1.5 rounded-lg border border-[#EBE5FC] shadow-sm hover:bg-[#F6F2FF] transition-colors text-xs font-bold"
            >
              {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {isCopied ? "복사완료" : "복사하기"}
            </button>
          </div>
          <div className="bg-white p-5 rounded-2xl text-sm text-[#3D2D66] leading-relaxed border border-[#EBE5FC] shadow-sm relative group whitespace-pre-wrap font-medium">
            {responsePlan}
            
            {/* Hover overlay for quick copy (Desktop mainly, but good to have) */}
            <div 
              onClick={handleCopy}
              className="absolute inset-0 bg-[#8257E5]/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl"
            >
              <div className="bg-white text-[#8257E5] px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                 <Copy size={16} /> 클릭하여 전체 복사
              </div>
            </div>
          </div>
        </div>

        {/* Used Data Tags */}
        <div className="pt-4 flex flex-wrap gap-2 px-1">
          {usedPublicData.map((data, index) => (
            <span key={index} className="text-[10px] bg-[#EBE5FC] text-[#8257E5] font-bold px-2 py-1 rounded-md">
              {data}
            </span>
          ))}
        </div>

      </div>
    </PageContainer>
  );
}

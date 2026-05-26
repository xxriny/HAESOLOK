"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveComplaint } from "@/lib/storage";
import { PersonType, ComplaintRecord } from "@/types/complaint";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export default function NewComplaintPage() {
  const router = useRouter();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [personType, setPersonType] = useState<PersonType>("학부모");
  const [content, setContent] = useState("");
  const [isScheduleRelated, setIsScheduleRelated] = useState(false);
  const [memo, setMemo] = useState("");

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
        schoolLevel: "초등학교",
        region: "서울",
        schedule: "1학기 학부모 상담 주간",
        scale: "중대형 학교",
        policyKeywords: ["생활지도", "교권보호", "학부모 응대"]
      }
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

        <SoftCard className="bg-secondary border-border">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-primary" />
            <h3 className="font-bold text-foreground text-sm">자동 첨부되는 공공데이터 맥락</h3>
          </div>
          <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc list-inside ml-1">
            <li>당일 학사일정 (나이스 API)</li>
            <li>학교 규모 및 환경 현황 (학교알리미)</li>
            <li>관련 교육 정책 및 법령 가이드 (교육데이터맵)</li>
          </ul>
        </SoftCard>

        <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
          저장된 내용은 AI 민원 대응 가이드 생성을 위한<br />참고 정보로만 사용되며 외부로 유출되지 않습니다.
        </p>

      </div>

      <div className="fixed bottom-0 left-0 w-full max-w-[430px] p-4 bg-white border-t border-border left-1/2 -translate-x-1/2 pb-8">
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

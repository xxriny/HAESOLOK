"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { ExampleDataNotice } from "@/components/cards/ExampleDataNotice";
import { MOCK_PUBLIC_DATA } from "@/data/mockPublicData";
import { Database, Link as LinkIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DataPage() {
  const getBadgeStyle = (status: string) => {
    switch(status) {
      case "api_possible": return "bg-blue-50 text-blue-600 border-blue-200";
      case "download": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "example": return "bg-neutral-100 text-neutral-600 border-neutral-200";
      case "internal_metric": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      default: return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  const getBadgeText = (status: string) => {
    switch(status) {
      case "api_possible": return "실제 연동 가능";
      case "download": return "다운로드 데이터 기반";
      case "internal_metric": return "서비스 내부 지표";
      default: return "MVP 예시 데이터";
    }
  };

  return (
    <PageContainer>
      <AppHeader title="공공데이터 활용 방식" />

      <div className="p-4 space-y-6 pb-24">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <h1 className="text-xl font-bold text-foreground mb-3">
            해소록은 공공데이터를 어떻게 활용하나요?
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-4">
            해소록은 교육 공공데이터를 교사의 민원 상황과 학교 맥락을 이해하기 위한 참고 데이터로 활용합니다.
          </p>
          <div className="bg-secondary p-3 rounded-xl flex items-start gap-2 border border-primary">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              공공데이터는 교사의 감정을 직접 판단하는 데이터가 아니라, 학교·교원·정책 맥락을 제공하는 참고 데이터로 활용됩니다.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_PUBLIC_DATA.map((data) => (
            <SoftCard key={data.id} className="space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5 mb-1">
                    <Database size={18} className="text-primary" />
                    {data.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{data.provider}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md border shrink-0", getBadgeStyle(data.status))}>
                  {getBadgeText(data.status)}
                </span>
              </div>

              {data.url && (
                <a href={data.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <LinkIcon size={12} />
                  출처 및 상세 데이터 보기
                </a>
              )}

              <div className="pt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground block mb-1">활용 항목</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.usedFields.map((field, i) => (
                      <span key={i} className="text-xs bg-white border border-border text-foreground px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground block mb-1">서비스 내 활용</span>
                  <p className="text-sm text-foreground">{data.usage}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-1">MVP 구현 방식</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {data.mvpImplementation}
                </p>
              </div>
            </SoftCard>
          ))}
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>알림:</strong> 전국 평균 온도는 공공데이터 원자료가 아니라, 공공데이터로 정의한 학교급·지역 비교군에 해소록 사용자의 익명 체크인 데이터를 집계해 생성하는 서비스 내부 지표입니다. 현재 화면은 예시 데이터입니다.
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            <strong>KEDI 데이터 활용:</strong> KEDI는 교사의 마음 온도 원자료를 제공하지 않습니다. 해소록에서는 학교급·지역 비교군을 정의하는 통계 근거로만 활용합니다.
          </p>
        </div>

        <div className="flex justify-center">
          <ExampleDataNotice message="일부 데이터는 MVP 화면 구성을 위한 예시 데이터입니다." />
        </div>
      </div>
    </PageContainer>
  );
}

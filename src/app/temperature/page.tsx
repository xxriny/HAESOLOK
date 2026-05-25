"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { ExampleDataNotice } from "@/components/cards/ExampleDataNotice";
import { TemperatureLineChart } from "@/components/charts/TemperatureLineChart";
import { MonthlyTemperatureChart } from "@/components/charts/MonthlyTemperatureChart";
import { Lightbulb, Info } from "lucide-react";

export default function TemperaturePage() {
  return (
    <PageContainer>
      <AppHeader title="온도 그래프" />

      <div className="p-4 space-y-6 pb-24">

        {/* Insight card */}
        <SoftCard className="bg-[#EFFFF0] border-[#8EEA7A] shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-[#8EEA7A] p-2 rounded-full mt-0.5">
              <Lightbulb size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#222222] mb-1">최근 2주간 마음 온도가 조금 낮아졌어요.</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                학부모 상담 주간 이후 온도가 하락하는 패턴이 관찰됩니다. 이번 주는 나를 돌보는 시간을 조금 더 챙겨보셔도 좋아요.
              </p>
            </div>
          </div>
        </SoftCard>

        {/* 14-day line chart */}
        <div>
          <h2 className="text-lg font-bold text-[#222222] mb-3 px-1">최근 14일 온도 변화</h2>
          <SoftCard className="p-3">
            <div className="h-[200px] w-full">
              <TemperatureLineChart />
            </div>
            <div className="mt-4 border-t border-[#E5F5E1] pt-3 space-y-1.5">
              <ExampleDataNotice message="위 그래프는 MVP 시연을 위한 예시 데이터가 포함되어 있습니다." />
              <div className="flex items-start gap-1.5 text-[10px] text-[#999999]">
                <Info size={12} className="shrink-0 mt-0.5" />
                <p>
                  전국 평균 온도는 공공데이터 원자료가 아니라, 해소록 사용자의 익명 체크인 데이터를 집계해 생성하는 서비스 내부 지표입니다.
                </p>
              </div>
            </div>
          </SoftCard>
        </div>

        {/* Monthly bar chart */}
        <div>
          <h2 className="text-lg font-bold text-[#222222] mb-3 px-1">월별 평균 온도</h2>
          <SoftCard className="p-3">
            <div className="h-[200px] w-full">
              <MonthlyTemperatureChart />
            </div>
            <div className="mt-4 border-t border-[#E5F5E1] pt-3">
              <ExampleDataNotice />
            </div>
          </SoftCard>
        </div>

      </div>
    </PageContainer>
  );
}

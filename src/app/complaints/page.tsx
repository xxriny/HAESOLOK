"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { getComplaints } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ComplaintRecord } from "@/types/complaint";
import { Plus, ChevronRight, Inbox } from "lucide-react";

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);

  useEffect(() => {
    setComplaints(getComplaints().reverse()); // newest first
  }, []);

  return (
    <PageContainer>
      <AppHeader title="민원 기록함" />

      <div className="p-4 space-y-6 pb-24">
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-foreground">
            민원 대응의 시작은<br />정확한 기록입니다.
          </h1>
        </div>

        <button
          onClick={() => router.push("/complaints/new")}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-colors shadow-md"
        >
          <Plus size={20} />
          새 민원 기록하기
        </button>

        <div className="space-y-3 pt-2">
          {complaints.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-white rounded-2xl border border-dashed border-border flex flex-col items-center gap-3">
              <Inbox size={48} className="text-neutral-200" />
              <p className="text-sm">아직 기록된 민원이 없습니다.<br/>새로운 내용을 기록해보세요.</p>
            </div>
          ) : (
            complaints.map(record => (
              <SoftCard key={record.id} className="cursor-pointer hover:border-primary transition-all" onClick={() => router.push(`/ai-guide`)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-secondary text-primary px-2 py-1 rounded border border-border">
                      {record.personType}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{record.date}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${record.status === "AI 가이드 생성됨" ? "bg-secondary text-primary border-primary" : "bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
                    {record.status === "AI 가이드 생성됨" ? "AI 가이드 완료" : "기록됨"}
                  </span>
                </div>
                <h3 className="font-bold text-foreground mb-1 line-clamp-1 text-sm">{record.content}</h3>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-muted-foreground">{record.location}</p>
                  <div className="flex items-center gap-0.5 text-primary text-xs font-bold">
                    가이드 보기 <ChevronRight size={14} />
                  </div>
                </div>
              </SoftCard>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}

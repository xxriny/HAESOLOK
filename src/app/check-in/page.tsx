"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTemperature } from "@/lib/storage";
import { TemperatureStatus, TemperatureRecord } from "@/types/temperature";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { label: TemperatureStatus; value: number }[] = [
  { label: "🥶 36도 미만: 많이 지친 날", value: 35.8 },
  { label: "😐 36~37도: 버틸 만한 날", value: 36.5 },
  { label: "🙂 37도 이상: 괜찮은 날", value: 37.2 },
];

const TAGS = [
  "학부모 민원", "생활지도", "행정업무", "수업 부담", "동료 관계", "기타"
];

export default function CheckInPage() {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<TemperatureStatus | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (!selectedStatus) return;

    const option = STATUS_OPTIONS.find(o => o.label === selectedStatus);

    const record: TemperatureRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      temperature: option?.value || 36.5,
      label: selectedStatus,
      tags: selectedTags,
      memo: memo || undefined,
    };

    saveTemperature(record);
    setIsSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <PageContainer className="justify-center items-center p-6 text-center">
        <div className="bg-secondary p-6 rounded-full mb-6">
          <HeartIcon className="text-primary w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">기록이 완료되었습니다.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          선생님의 정서 데이터는 익명화되어<br />전국 교사 정서 통계 분석에 활용됩니다.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AppHeader title="온도 체크인" showBack />

      <div className="p-4 space-y-6 pb-24">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">오늘 마음 온도는 어떠신가요?</h2>
          <p className="text-sm text-muted-foreground">선생님의 하루를 가볍게 골라주세요.</p>
        </div>

        <div className="space-y-3">
          {STATUS_OPTIONS.map((opt) => (
            <SoftCard
              key={opt.label}
              onClick={() => setSelectedStatus(opt.label)}
              className={cn(
                "transition-all duration-200 cursor-pointer border",
                selectedStatus === opt.label ? "border-primary shadow-sm bg-secondary" : "border-border bg-white"
              )}
            >
              <div className="text-base font-bold text-foreground">{opt.label}</div>
            </SoftCard>
          ))}
        </div>

        {selectedStatus && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="font-bold mb-3 text-sm text-foreground">오늘 마음을 가장 많이 차지한 게 무엇인가요?</h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedTags.includes(tag)
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-muted-foreground border-border"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3 text-sm text-foreground">기억하고 싶은 메모가 있다면 남겨주세요. (선택)</h3>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 학부모 상담 후 계속 마음이 불편했다, 아이들이 수업에 적극적이어서 기뻤다 등"
                className="w-full p-4 rounded-xl border border-border bg-white text-sm min-h-[120px] resize-none focus:ring-1 focus:ring-primary outline-none placeholder:text-neutral-300"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-md"
            >
              기록 완료하기
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
    </svg>
  );
}


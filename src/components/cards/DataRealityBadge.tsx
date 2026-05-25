import { cn } from "@/lib/utils";

const badgeText = {
  api_possible: "실제 연동 가능",
  download: "다운로드 기반",
  example: "MVP 예시 데이터",
  internal_metric: "서비스 내부 지표",
};

const badgeStyle = {
  api_possible: "bg-blue-50 text-blue-600 border-blue-200",
  download: "bg-indigo-50 text-indigo-600 border-indigo-200",
  example: "bg-neutral-100 text-neutral-600 border-neutral-200",
  internal_metric: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export function DataRealityBadge({ status, className }: { status: keyof typeof badgeText; className?: string }) {
  return (
    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md border shrink-0", badgeStyle[status], className)}>
      {badgeText[status]}
    </span>
  );
}

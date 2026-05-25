import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExampleDataNotice({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex items-start gap-1.5 text-[10px] text-[#999999] mt-2", className)}>
      <Info size={12} className="shrink-0 mt-0.5" />
      <p className="leading-snug">
        {message || "일부 데이터는 MVP 화면 구성을 위한 예시 데이터입니다."}
      </p>
    </div>
  );
}

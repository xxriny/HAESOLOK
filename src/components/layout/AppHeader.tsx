"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export function AppHeader({ title, showBack, onBack, className }: AppHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("sticky top-0 z-10 flex items-center h-14 bg-secondary px-4", className)}>
      {showBack && (
        <button 
          onClick={onBack ? onBack : () => router.back()} 
          className="p-2 -ml-2 text-foreground"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {title && (
        <h1 className={cn("text-lg font-bold text-foreground", showBack ? "ml-2" : "")}>
          {title}
        </h1>
      )}
    </div>
  );
}

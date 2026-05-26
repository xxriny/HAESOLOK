"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function MobileShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center w-full">
      <div className={cn("w-full max-w-[430px] min-h-screen bg-secondary flex flex-col shadow-xl relative", className)}>
        {children}
      </div>
    </div>
  );
}

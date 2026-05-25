"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative", className)}>
      {children}
    </div>
  );
}

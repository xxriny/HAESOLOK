"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, LineChart, Heart, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "홈", path: "/dashboard", icon: Home },
    { label: "온도", path: "/temperature", icon: LineChart },
    { label: "케어", path: "/care", icon: Heart },
    { label: "민원", path: "/complaints", icon: Shield },
    { label: "데이터", path: "/data", icon: Database },
  ];

  if (pathname === "/" || pathname === "/onboarding") return null;

  return (
    <div className="sticky bottom-0 left-0 w-full bg-white border-t border-[#E5F5E1] pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-[#58C85A]" : "text-[#777777]"
              )}
            >
              <Icon size={20} className={cn("transition-colors", isActive ? "text-[#58C85A]" : "text-[#777777]")} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

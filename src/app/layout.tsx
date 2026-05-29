import type { Metadata } from "next";
import "./globals.css";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "해소록 - 선생님을 위한 AI 보호 서비스",
  description: "선생님의 하루를 기록하고, 마음의 무게를 덜어드릴게요. 교육 공공데이터 기반 교사 보호 플랫폼.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <MobileShell>
          {children}
          <BottomNav />
        </MobileShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <MobileShell>
          {children}
          <BottomNav />
        </MobileShell>
      </body>
    </html>
  );
}

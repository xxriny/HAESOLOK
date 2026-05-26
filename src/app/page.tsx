"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useEffect } from "react";
import { getProfile } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const profile = getProfile();
    if (profile) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <PageContainer className="bg-primary justify-center items-center p-6 text-center">
      <div className="bg-white/90 p-6 rounded-full mb-8 shadow-sm">
        <Heart size={48} className="text-primary" />
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-3 font-serif">
        해소록
      </h1>
      <p className="text-xl font-medium text-foreground mb-8 leading-tight">
        선생님의 하루를 기록하고,<br />마음의 무게를 덜어드릴게요.
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-md w-full max-w-sm mb-12">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          교육 공공데이터와 AI를 활용해 교사의 민원 대응과 번아웃 조기 감지를 돕는 교사 보호 서비스
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          "선생님 곁에서, 기록하고 지키고 쉬게 합니다."
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 px-4">
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
        >
          해소록 시작하기
        </button>
        <button
          onClick={() => router.push("/data")}
          className="w-full py-4 bg-white/40 text-foreground rounded-xl font-medium hover:bg-white/60 transition-colors"
        >
          데이터 활용 방식 보기
        </button>
      </div>
    </PageContainer>
  );
}

"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { SoftCard } from "@/components/cards/SoftCard";
import { getProfile, clearStorage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { TeacherProfile } from "@/types/teacher";
import { useRouter } from "next/navigation";
import { User, MapPin, School, Bell, Briefcase, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
  }, [router]);

  if (!profile) return null;

  const handleLogout = () => {
    if (confirm("저장된 모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?")) {
      clearStorage();
      router.replace("/onboarding");
    }
  };

  return (
    <PageContainer>
      <AppHeader title="내 정보" showBack />
      
      <div className="p-5 pb-8 space-y-6">
        <div className="flex flex-col items-center justify-center py-6 bg-white rounded-3xl border border-border shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
            <User size={40} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {profile.schoolLevel} 선생님
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.region} 교육청 소속
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-foreground px-1">등록된 기본 정보</h3>
          
          <SoftCard className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <School size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">학교 정보</p>
                <p className="text-sm font-bold text-foreground">
                  {profile.schoolName || "학교 미등록"} 
                  {profile.fondSc && <span className="text-xs font-normal text-muted-foreground ml-1">({profile.fondSc})</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">관할 교육청</p>
                <p className="text-sm font-bold text-foreground">
                  {profile.educationOfficeName || `${profile.region} 교육청 (자동배정)`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <Briefcase size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">담당 역할</p>
                <p className="text-sm font-bold text-foreground">{profile.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <Bell size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">알림 수신 시간</p>
                <p className="text-sm font-bold text-foreground">{profile.notificationTime}</p>
              </div>
            </div>
          </SoftCard>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 mt-8 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm border border-rose-100"
        >
          <LogOut size={18} />
          <span>데이터 초기화 (다시 시작하기)</span>
        </button>
      </div>
    </PageContainer>
  );
}

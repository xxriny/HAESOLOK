import { CareContent, CounselingCenter } from "../types/care";

export const MOCK_CARE_CONTENTS: CareContent[] = [
  {
    id: "care-1",
    title: "5분 호흡법",
    description: "눈을 감고 천천히 숨을 들이마시고 내쉬어보세요. 복잡한 마음을 조금 가라앉힐 수 있습니다.",
    type: "breathing",
    durationMinutes: 5,
  },
  {
    id: "care-2",
    title: "마음 정리 글귀",
    description: "오늘 하루, 선생님이 하신 모든 일들은 충분히 의미있었습니다. 잠시 내려놓아도 괜찮아요.",
    type: "quote",
    durationMinutes: 1,
  },
  {
    id: "care-3",
    title: "짧은 마음 환기 루틴",
    description: "창밖을 보며 따뜻한 차 한 잔을 마시는 시간을 가져보세요.",
    type: "routine",
    durationMinutes: 5,
  }
];

export const MOCK_COUNSELING_CENTERS: CounselingCenter[] = [
  {
    id: "counsel-1",
    name: "서울교원힐링지원센터",
    region: "서울",
    phone: "02-1234-5678",
    description: "교원의 심리적 회복을 지원하는 전문 상담 센터입니다."
  },
  {
    id: "counsel-2",
    name: "경기교권보호지원센터",
    region: "경기",
    phone: "031-1234-5678",
    description: "교육활동 침해 사안 및 교원 스트레스 상담을 제공합니다."
  }
];

import { TemperatureRecord } from "@/types/temperature";
import { ComplaintRecord } from "@/types/complaint";
import { RiskStatus } from "@/types/care";

export type { RiskStatus };

export interface RiskAnalysis {
  status: RiskStatus;
  avg14: number | null;
  avg7: number | null;
  prevAvg7: number | null;
  lowDays: number;
  parentComplaintCount: number;
  reasons: string[];
  recommendedLevel: "stable" | "caution" | "support_needed";
}

function sortRecent(records: TemperatureRecord[]) {
  return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateAverage(records: TemperatureRecord[]): number | null {
  if (records.length === 0) return null;
  return round(records.reduce((sum, record) => sum + record.temperature, 0) / records.length);
}

export function countLowTemperatureDays(records: TemperatureRecord[]): number {
  return records.filter((record) => record.temperature < 36.0).length;
}

export function countTag(records: TemperatureRecord[], tag: string): number {
  return records.filter((record) => record.tags.includes(tag)).length;
}

export function detectRisk(
  temperatureRecords: TemperatureRecord[],
  complaintRecords: ComplaintRecord[] = []
): RiskAnalysis {
  const sorted = sortRecent(temperatureRecords);
  const recent14 = sorted.slice(0, 14);
  const recent7 = sorted.slice(0, 7);
  const previous7 = sorted.slice(7, 14);

  const avg14 = calculateAverage(recent14);
  const avg7 = calculateAverage(recent7);
  const prevAvg7 = calculateAverage(previous7);
  const lowDays = countLowTemperatureDays(recent14);
  
  // Rule: Parent complaint tag repeated 3 times or more
  const parentComplaintTagCount = countTag(recent14, "학부모 민원");
  const parentComplaintRecordCount = complaintRecords.filter((record) => 
    record.personType === "학부모" || record.content.includes("학부모")
  ).length;
  const parentComplaintCount = Math.max(parentComplaintTagCount, parentComplaintRecordCount);

  const reasons: string[] = [];
  let status: RiskStatus = "stable";

  // Rule: Recent 14-day average < 36.0 -> support_needed
  if (avg14 !== null && avg14 < 36.0) {
    status = "support_needed";
    reasons.push("최근 14일 평균 온도가 36.0도 미만입니다.");
  }

  // Rule: 7 or more days below 36.0 in recent 14 days -> support_needed
  if (lowDays >= 7) {
    status = "support_needed";
    reasons.push(`최근 14일 중 36도 미만인 날이 ${lowDays}일 발생했습니다.`);
  }

  // Rule: Recent 7-day average fell by 0.7 or more compared to previous 7 days -> caution
  if (avg7 !== null && prevAvg7 !== null && prevAvg7 - avg7 >= 0.7) {
    if (status !== "support_needed") status = "caution";
    reasons.push(`최근 7일 평균 온도가 이전 7일 대비 ${round(prevAvg7 - avg7)}도 급격히 하락했습니다.`);
  }

  // Rule: Parent complaint count >= 3 -> caution
  if (parentComplaintCount >= 3) {
    if (status !== "support_needed") status = "caution";
    reasons.push("학부모 민원 관련 기록이 3회 이상 반복되었습니다.");
  }

  if (reasons.length === 0) {
    reasons.push("최근 기록에서 특이사항이 발견되지 않았습니다.");
  }

  return {
    status,
    avg14,
    avg7,
    prevAvg7,
    lowDays,
    parentComplaintCount,
    reasons,
    recommendedLevel: status,
  };
}

export function calculateRiskStatus(
  temperatures: TemperatureRecord[],
  complaints: ComplaintRecord[]
): { status: RiskStatus; reasons: string[] } {
  const result = detectRisk(temperatures, complaints);
  return { status: result.status, reasons: result.reasons };
}

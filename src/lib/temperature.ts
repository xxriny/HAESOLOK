import { AverageTemperatureData, TemperatureRecord, TemperatureStatus } from "@/types/temperature";

export function mergePersonalAndNationalAverage(
  personalRecords: TemperatureRecord[],
  nationalAverage: AverageTemperatureData[]
): AverageTemperatureData[] {
  const byDate = new Map(personalRecords.map((record) => [record.date, record.temperature]));
  return nationalAverage.map((average) => ({
    ...average,
    myTemperature: byDate.get(average.date) ?? average.myTemperature,
  }));
}

export function getMonthlyAverage(records: TemperatureRecord[], month: string): number | null {
  const monthly = records.filter((record) => record.date.startsWith(month));
  if (monthly.length === 0) return null;
  const value = monthly.reduce((sum, record) => sum + record.temperature, 0) / monthly.length;
  return Math.round(value * 10) / 10;
}

export function getTemperatureLabel(value: number): TemperatureStatus {
  if (value < 36) return "🥶 36도 미만: 많이 지친 날";
  if (value < 37) return "😐 36~37도: 버틸 만한 날";
  return "🙂 37도 이상: 괜찮은 날";
}

export function getTemperatureInsight(records: TemperatureRecord[]): string {
  if (records.length === 0) {
    return "기록된 온도가 없습니다. 오늘 하루를 먼저 기록해보세요.";
  }

  const recent = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  const average = recent.reduce((sum, record) => sum + record.temperature, 0) / recent.length;

  if (average < 36) return "최근 온도가 많이 낮아지고 있어요. 나를 위한 휴식 시간을 먼저 챙겨보세요.";
  if (average < 36.7) return "최근 온도가 조금 불안정합니다. 주변 동료나 상담 센터의 도움을 고려해보세요.";
  return "최근 온도가 비교적 안정적입니다. 지금처럼 나를 돌보는 습관을 유지해보세요.";
}

export type TemperatureStatus = "🥶 36도 미만: 많이 지친 날" | "😐 36~37도: 버틸 만한 날" | "🙂 37도 이상: 괜찮은 날";

export interface TemperatureRecord {
  id: string;
  date: string; // YYYY-MM-DD
  temperature: number; // e.g. 35.8
  label: TemperatureStatus;
  tags: string[];
  memo?: string;
}

export interface AverageTemperatureData {
  date: string;
  myTemperature: number;
  schoolLevelAverage: number;
}

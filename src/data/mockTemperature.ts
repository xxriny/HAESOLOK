import { AverageTemperatureData } from "../types/temperature";

export const MOCK_AVERAGE_TEMPERATURES: AverageTemperatureData[] = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toISOString().split("T")[0],
    myTemperature: parseFloat((35.5 + Math.random() * 2).toFixed(1)),
    schoolLevelAverage: parseFloat((36.0 + Math.random() * 0.8).toFixed(1)),
  };
});

export const MOCK_MONTHLY_AVERAGE = [
  { month: "1월", myAverage: 36.5, schoolLevelAverage: 36.6 },
  { month: "2월", myAverage: 36.4, schoolLevelAverage: 36.5 },
  { month: "3월", myAverage: 35.8, schoolLevelAverage: 36.2 },
  { month: "4월", myAverage: 36.1, schoolLevelAverage: 36.3 },
  { month: "5월", myAverage: 35.9, schoolLevelAverage: 36.1 },
];

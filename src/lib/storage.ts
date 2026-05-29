import { TeacherProfile } from "../types/teacher";
import { TemperatureRecord } from "../types/temperature";
import { ComplaintRecord } from "../types/complaint";

export const StorageKeys = {
  PROFILE: "haesolog_profile",
  TEMPERATURES: "haesolog_temperatures",
  COMPLAINTS: "haesolog_complaints",
};

export const getProfile = (): TeacherProfile | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(StorageKeys.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: TeacherProfile) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(StorageKeys.PROFILE, JSON.stringify(profile));
};

export const getTemperatures = (): TemperatureRecord[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(StorageKeys.TEMPERATURES);
  return data ? JSON.parse(data) : [];
};

export const saveTemperature = (record: TemperatureRecord) => {
  if (typeof window === "undefined") return;
  const temps = getTemperatures();
  temps.push(record);
  localStorage.setItem(StorageKeys.TEMPERATURES, JSON.stringify(temps));
};

export const getComplaints = (): ComplaintRecord[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(StorageKeys.COMPLAINTS);
  return data ? JSON.parse(data) : [];
};

export const saveComplaint = (record: ComplaintRecord) => {
  if (typeof window === "undefined") return;
  const complaints = getComplaints();
  complaints.push(record);
  localStorage.setItem(StorageKeys.COMPLAINTS, JSON.stringify(complaints));
};

export const updateComplaintStatus = (id: string, status: "기록됨" | "AI 가이드 생성됨") => {
  if (typeof window === "undefined") return;
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index !== -1) {
    complaints[index].status = status;
    localStorage.setItem(StorageKeys.COMPLAINTS, JSON.stringify(complaints));
  }
};

export const clearStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(StorageKeys.PROFILE);
  localStorage.removeItem(StorageKeys.TEMPERATURES);
  localStorage.removeItem(StorageKeys.COMPLAINTS);
};

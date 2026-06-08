import { Topic, WordProgress, StudyMeta } from "./types";
import { defaultTopics } from "../data/defaultTopics";

const TOPICS_KEY = "toeic_topics";
const PROGRESS_KEY = "toeic_progress";
const META_KEY = "toeic_meta";

// --- Topics ---
export function getTopics(): Topic[] {
  if (typeof window === "undefined") return defaultTopics;
  const data = localStorage.getItem(TOPICS_KEY);
  if (!data) {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(defaultTopics));
    return defaultTopics;
  }
  return JSON.parse(data);
}

export function saveTopics(topics: Topic[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
}

export function getTopic(id: string): Topic | undefined {
  return getTopics().find(t => t.id === id);
}

// --- Progress ---
export function getAllProgress(): Record<string, WordProgress> {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(PROGRESS_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveAllProgress(progress: Record<string, WordProgress>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getWordProgress(wordId: string): WordProgress {
  const all = getAllProgress();
  if (all[wordId]) return all[wordId];
  
  // Default new progress
  const today = new Date().toISOString().split('T')[0];
  return {
    wordId,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    lastReview: "",
    nextReview: today,
    status: "new"
  };
}

export function updateWordProgress(wordId: string, progress: WordProgress): void {
  const all = getAllProgress();
  all[wordId] = progress;
  saveAllProgress(all);
}

// --- Meta ---
export function getMeta(): StudyMeta {
  const defaultMeta: StudyMeta = {
    startDate: "",
    lastStudyDate: "",
    streak: 0,
    totalReviewed: 0,
    emailJS_serviceId: "",
    emailJS_templateId: "",
    emailJS_publicKey: "",
    userEmail: ""
  };
  if (typeof window === "undefined") return defaultMeta;
  const data = localStorage.getItem(META_KEY);
  return data ? { ...defaultMeta, ...JSON.parse(data) } : defaultMeta;
}

export function saveMeta(meta: StudyMeta): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function updateMeta(updates: Partial<StudyMeta>): void {
  const meta = getMeta();
  saveMeta({ ...meta, ...updates });
}

import { Topic, WordProgress, StudyMeta } from "./types";
import { initProgress } from "./levelSystem";
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
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    // MIGRATION: nếu data cũ có field "interval" (SM-2) → convert sang level
    const migrated: Record<string, WordProgress> = {};
    for (const [id, p] of Object.entries(parsed)) {
      const old = p as Record<string, unknown>;
      if ("interval" in old) {
        // Convert SM-2 → level dựa trên repetitions
        const reps = (old.repetitions as number) ?? 0;
        const level = reps <= 1 ? 1 : reps <= 3 ? 2 : reps <= 6 ? 3 : 4;
        migrated[id] = {
          wordId: id,
          level: level as 1 | 2 | 3 | 4,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,
          totalReviews: reps,
          lastReview: (old.lastReview as string) || new Date().toISOString().split("T")[0],
          firstLearnedAt: (old.lastReview as string) || new Date().toISOString().split("T")[0],
        };
      } else {
        migrated[id] = p as WordProgress;
      }
    }
    return migrated;
  } catch {
    return {};
  }
}

export function saveAllProgress(progress: Record<string, WordProgress>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getWordProgress(wordId: string): WordProgress | null {
  const all = getAllProgress();
  return all[wordId] ?? null;
}

export function saveWordProgress(wordId: string, progress: WordProgress): void {
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

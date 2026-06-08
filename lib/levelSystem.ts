import { WordProgress } from "./types";

// Số lần đúng liên tiếp cần để lên level
const CORRECT_TO_LEVEL_UP: Record<number, number> = {
  1: 2,  // level 1 → 2: cần đúng 2 lần liên tiếp
  2: 3,  // level 2 → 3: cần đúng 3 lần liên tiếp
  3: 4,  // level 3 → 4: cần đúng 4 lần liên tiếp
  4: 4,  // level 4: giữ nguyên
};

// Số lần sai liên tiếp để xuống level
const WRONG_TO_LEVEL_DOWN = 1; // sai 1 lần là xuống ngay

export function initProgress(wordId: string): WordProgress {
  return {
    wordId,
    level: 1,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    totalReviews: 0,
    lastReview: new Date().toISOString().split("T")[0],
    firstLearnedAt: new Date().toISOString().split("T")[0],
  };
}

export function updateLevel(
  progress: WordProgress | null,
  correct: boolean
): WordProgress {
  const prev = progress ?? initProgress("__temp__");
  const now = new Date().toISOString().split("T")[0];

  if (correct) {
    const newConsecutiveCorrect = prev.consecutiveCorrect + 1;
    const threshold = CORRECT_TO_LEVEL_UP[prev.level] ?? 4;
    const shouldLevelUp =
      newConsecutiveCorrect >= threshold && prev.level < 4;

    return {
      ...prev,
      level: shouldLevelUp ? ((prev.level + 1) as 1 | 2 | 3 | 4) : prev.level,
      consecutiveCorrect: shouldLevelUp ? 0 : newConsecutiveCorrect,
      consecutiveWrong: 0,
      totalReviews: prev.totalReviews + 1,
      lastReview: now,
    };
  } else {
    const newConsecutiveWrong = prev.consecutiveWrong + 1;
    const shouldLevelDown =
      newConsecutiveWrong >= WRONG_TO_LEVEL_DOWN && prev.level > 1;

    return {
      ...prev,
      level: shouldLevelDown ? ((prev.level - 1) as 1 | 2 | 3 | 4) : prev.level,
      consecutiveCorrect: 0,
      consecutiveWrong: shouldLevelDown ? 0 : newConsecutiveWrong,
      totalReviews: prev.totalReviews + 1,
      lastReview: now,
    };
  }
}

// Sắp xếp từ để ôn: level thấp trước, trong cùng level thì lâu không ôn lên trước
export function sortWordsForReview(
  wordIds: string[],
  allProgress: Record<string, WordProgress>
): string[] {
  return [...wordIds].sort((a, b) => {
    const pa = allProgress[a];
    const pb = allProgress[b];

    // Từ chưa học lên đầu tiên
    if (!pa && pb) return -1;
    if (pa && !pb) return 1;
    if (!pa && !pb) return 0;

    // Level thấp trước
    if (pa.level !== pb.level) return pa.level - pb.level;

    // Cùng level: lâu không ôn lên trước
    return pa.lastReview < pb.lastReview ? -1 : 1;
  });
}

export const LEVEL_CONFIG = [
  {
    level: 1,
    label: "Mới học",
    sublabel: "Cần ôn nhiều",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
    emoji: "🔴",
  },
  {
    level: 2,
    label: "Đang nhớ",
    sublabel: "Còn lẫn lộn",
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    emoji: "🟡",
  },
  {
    level: 3,
    label: "Nhớ tốt",
    sublabel: "Khá vững",
    color: "#3b82f6",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-400",
    borderClass: "border-blue-500/30",
    emoji: "🔵",
  },
  {
    level: 4,
    label: "Thuộc lòng",
    sublabel: "Rất vững",
    color: "#22c55e",
    bgClass: "bg-green-500/10",
    textClass: "text-green-400",
    borderClass: "border-green-500/30",
    emoji: "🟢",
  },
] as const;

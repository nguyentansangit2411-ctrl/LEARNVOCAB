PROMPT: Refactor toàn bộ hệ thống học từ vựng — từ SM-2 sang Level-Based SRS
Bối cảnh
Next.js 14 App Router + TypeScript + Tailwind CSS. Data lưu localStorage. Đây là refactor lớn: thay toàn bộ thuật toán SM-2 bằng hệ thống level 1→4 đơn giản, trực quan như Mochi Mochi Vocab.

BƯỚC 1 — Sửa lib/types.ts
Thay WordProgress:

typescript
export interface WordProgress {
  wordId: string;
  level: 1 | 2 | 3 | 4;       // mức độ nhớ hiện tại
  consecutiveCorrect: number;   // số lần đúng liên tiếp trong level hiện tại
  consecutiveWrong: number;     // số lần sai liên tiếp
  totalReviews: number;         // tổng số lần đã ôn
  lastReview: string;           // ISO date string
  firstLearnedAt: string;       // ngày học lần đầu
}

// Xóa hoàn toàn: interval, easeFactor, repetitions, nextReview, status
Giữ nguyên Word, Topic, StudyMeta, DayPlan.

BƯỚC 2 — Tạo lib/levelSystem.ts (thay thế lib/sm2.ts)
typescript
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
BƯỚC 3 — Sửa lib/storage.ts
Thay toàn bộ logic liên quan SM-2. localStorage key giữ nguyên "toeic_progress" để không mất data — migration tự động:

typescript
import { WordProgress } from "./types";
import { initProgress } from "./levelSystem";

// localStorage key: "toeic_progress"
// Shape: Record<wordId, WordProgress>

export function getAllProgress(): Record<string, WordProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("toeic_progress");
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
          lastReview: (old.lastReview as string) ?? new Date().toISOString().split("T")[0],
          firstLearnedAt: (old.lastReview as string) ?? new Date().toISOString().split("T")[0],
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
  localStorage.setItem("toeic_progress", JSON.stringify(progress));
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

// Giữ lại các hàm getTopics, saveTopics, getMeta, saveMeta không đổi
BƯỚC 4 — Sửa lib/studyPlan.ts
Thay logic dùng nextReview bằng level-based priority:

typescript
// reviewWords của mỗi ngày = TẤT CẢ từ đã học (level >= 1), không filter theo date
// sort: level 1 trước, trong cùng level thì lastReview cũ nhất trước

// Trong generateStudyPlan(), thay đoạn reviewWords:
const allProgress = getAllProgress();

let reviewWords: string[] = [];
if (dateStr <= todayStr) {
  reviewWords = sortWordsForReview(
    Object.keys(allProgress),
    allProgress
  );
}

// estimatedMinutes: từ mới 1.5 phút, từ ôn 0.3 phút (nhanh hơn vì đã biết)
const estimatedMinutes = Math.round(newWordCount * 1.5 + reviewWords.length * 0.3);

// completedNewTopics: từ có level >= 2 là đã "học qua"
const completedNewTopics = newTopics.filter(tId => {
  const topic = topics.find(t => t.id === tId);
  if (!topic || topic.words.length === 0) return false;
  return topic.words.every(w => {
    const p = allProgress[w.id];
    return p && p.level >= 2;
  });
});
BƯỚC 5 — Sửa app/study/[id]/page.tsx (Flashcard)
Thay updateSM2 bằng updateLevel. Mapping nút đánh giá:

typescript
// Bỏ 4 nút cũ (0/2/3/5), thay bằng 2 nút đơn giản hơn:
// ❌ Chưa nhớ  → updateLevel(progress, false)
// ✅ Nhớ rồi  → updateLevel(progress, true)

// Hoặc giữ 4 nút nhưng map lại:
// 😵 Quên      → updateLevel(progress, false)
// 😕 Khó       → updateLevel(progress, false)  
// 🙂 Nhớ ra   → updateLevel(progress, true)
// 😊 Dễ        → updateLevel(progress, true) — gọi 2 lần (double credit)

// Hiển thị level badge trên mỗi flashcard:
const levelCfg = LEVEL_CONFIG[progress.level - 1];
<span className={`text-xs px-2 py-0.5 rounded-full ${levelCfg.bgClass} ${levelCfg.textClass}`}>
  {levelCfg.emoji} {levelCfg.label}
</span>
BƯỚC 6 — Sửa app/review/page.tsx
typescript
// Lấy TẤT CẢ từ đã có progress, sort theo level thấp trước
const allProgress = getAllProgress();
const allTopics = getTopics();

// Gom tất cả wordId đã học
const allLearnedWordIds = Object.keys(allProgress);

// Sort: level 1 → 4, trong cùng level lastReview cũ nhất lên trước
const sortedWordIds = sortWordsForReview(allLearnedWordIds, allProgress);

// Map sang Word objects
const allWords = allTopics.flatMap(t => t.words);
const reviewQueue = sortedWordIds
  .map(id => allWords.find(w => w.id === id))
  .filter(Boolean) as Word[];

// Header hiển thị breakdown:
// 🔴 X từ  🟡 X từ  🔵 X từ  🟢 X từ
BƯỚC 7 — Sửa app/quiz/[id]/page.tsx
Thay updateSM2 bằng updateLevel:

typescript
// Đúng hoàn toàn:
const updated = updateLevel(getWordProgress(word.id), true);

// Gần đúng (levenshtein = 1): tính là đúng nhưng không double credit
const updated = updateLevel(getWordProgress(word.id), true);

// Sai:
const updated = updateLevel(getWordProgress(word.id), false);

saveWordProgress(word.id, updated);
BƯỚC 8 — Sửa app/page.tsx — SRS Chart
typescript
const allProgress = Object.values(getAllProgress());
const totalWords = getTopics().reduce((s, t) => s + t.words.length, 0);

const levels = LEVEL_CONFIG.map(cfg => ({
  ...cfg,
  count: allProgress.filter(p => p.level === cfg.level).length,
}));

const totalLearned = allProgress.length;
const notStarted = totalWords - totalLearned;
const maxCount = Math.max(...levels.map(l => l.count), 1);
Chart render giống prompt trước, chỉ thay data source. Thêm dòng breakdown nhỏ dưới mỗi bar:

tsx
// Dưới mỗi bar, hiển thị progress nhỏ:
// "Cần X lần đúng liên tiếp để lên level tiếp"
BƯỚC 9 — Xóa lib/sm2.ts
Xóa file này sau khi đã thay hết reference bằng levelSystem.ts.

Tìm và replace toàn bộ import:

"import { updateSM2 } from '@/lib/sm2'"
→ "import { updateLevel, initProgress } from '@/lib/levelSystem'"
Checklist kiểm tra sau khi xong
 npm run build không có TypeScript error
 Mở app lần đầu: data cũ (SM-2) tự migrate sang level mà không mất từ vựng
 Flashcard: bấm ✅/❌ thay đổi level đúng, hiển thị badge level trên thẻ
 Review page: hiển thị tất cả từ đã học, level 1 lên đầu
 Quiz page: đúng/sai cập nhật level, không còn dùng SM-2
 Dashboard chart: 4 cột màu, animated, số từ đúng theo level thực tế
 Không còn import nào từ sm2.ts

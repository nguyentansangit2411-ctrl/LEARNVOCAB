import { DayPlan } from "./types";
import { getTopics, getAllProgress, getMeta } from "./storage";
import { sortWordsForReview } from "./levelSystem";
import { addDays, format } from "date-fns";

const TOTAL_DAYS = 21;
const TARGET_WORDS_PER_DAY = 25; // ~25 từ/ngày là cognitive load tối ưu
const MIN_WORDS_PER_DAY = 15;
const MAX_WORDS_PER_DAY = 40;

/**
 * Phân bổ topics vào 21 ngày dựa trên số từ thực tế của từng topic.
 * Không hardcode số topic/ngày — gom topic cho đến khi đủ ~TARGET_WORDS_PER_DAY.
 * Nếu 1 topic có quá nhiều từ (>MAX), tách ra thành nhiều ngày.
 */
function distributeTopicsIntoDays(
  topics: { id: string; words: { id: string }[] }[]
): string[][] {
  // Lọc bỏ topic rỗng để không chiếm slot ngày
  const nonEmptyTopics = topics.filter(t => t.words.length > 0);

  const days: string[][] = Array.from({ length: TOTAL_DAYS }, () => []);

  if (nonEmptyTopics.length === 0) {
    // Chưa nhập từ — chia đều topic (kể cả rỗng) vào các ngày
    const allTopics = topics;
    const perDay = Math.ceil(allTopics.length / TOTAL_DAYS);
    let ti = 0;
    for (let d = 0; d < TOTAL_DAYS && ti < allTopics.length; d++) {
      for (let i = 0; i < perDay && ti < allTopics.length; i++, ti++) {
        days[d].push(allTopics[ti].id);
      }
    }
    return days;
  }

  let dayIndex = 0;
  let wordsAccum = 0;

  for (const topic of nonEmptyTopics) {
    if (dayIndex >= TOTAL_DAYS) break;

    const wCount = topic.words.length;

    // Nếu topic này sẽ đẩy ngày hiện tại vượt MAX và ngày hiện tại đã có từ → sang ngày mới
    if (wordsAccum + wCount > MAX_WORDS_PER_DAY && wordsAccum >= MIN_WORDS_PER_DAY) {
      dayIndex++;
      wordsAccum = 0;
      if (dayIndex >= TOTAL_DAYS) break;
    }

    days[dayIndex].push(topic.id);
    wordsAccum += wCount;

    // Nếu đã đủ TARGET hoặc vượt MAX → sang ngày mới
    if (wordsAccum >= TARGET_WORDS_PER_DAY) {
      dayIndex++;
      wordsAccum = 0;
    }
  }

  return days;
}

export function generateStudyPlan(startDateStr: string): DayPlan[] {
  const topics = getTopics();
  const allProgress = getAllProgress();
  const startDate = new Date(startDateStr);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Phân bổ động dựa trên số từ thực tế
  const topicsByDay = distributeTopicsIntoDays(topics);

  const plan: DayPlan[] = [];

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const dateObj = addDays(startDate, day - 1);
    const dateStr = format(dateObj, "yyyy-MM-dd");
    const newTopics = topicsByDay[day - 1] || [];

    // Tổng từ mới thực tế của ngày này
    const newWordCount = newTopics.reduce((sum, tId) => {
      const t = topics.find(t => t.id === tId);
      return sum + (t?.words.length || 0);
    }, 0);

    // Review words: chỉ tính cho ngày đã qua hoặc hôm nay
    let reviewWords: string[] = [];
    if (dateStr <= todayStr) {
      reviewWords = sortWordsForReview(
        Object.keys(allProgress),
        allProgress
      );
    }

    // Completed topics: mọi từ trong topic đã được học ít nhất 1 lần
    const completedNewTopics = newTopics.filter(tId => {
      const topic = topics.find(t => t.id === tId);
      if (!topic || topic.words.length === 0) return false;
      return topic.words.every(w => {
        const p = allProgress[w.id];
        return p && p.level >= 2;
      });
    });

    // Status
    let status: "not-started" | "in-progress" | "completed" = "not-started";
    if (
      newTopics.length > 0 &&
      completedNewTopics.length === newTopics.length &&
      reviewWords.length === 0
    ) {
      status = "completed";
    } else if (completedNewTopics.length > 0 || reviewWords.length > 0) {
      status = "in-progress";
    }

    // Ước tính thời gian thực tế: 1.5 phút/từ mới, 0.3 phút/từ ôn (nhanh hơn vì đã biết)
    const estimatedMinutes = Math.round(
      newWordCount * 1.5 + reviewWords.length * 0.3
    );

    plan.push({
      day,
      date: dateStr,
      newTopics,
      reviewWords,
      estimatedMinutes,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      isFuture: dateStr > todayStr,
      completedNewTopics,
      status,
    });
  }

  return plan;
}

export function getTodayPlan(): DayPlan | null {
  const meta = getMeta();
  if (!meta.startDate) return null;
  const plan = generateStudyPlan(meta.startDate);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  return plan.find(p => p.date === todayStr) || null;
}

export function getDayProgress(dayPlan: DayPlan): number {
  if (dayPlan.newTopics.length === 0) return 100;
  return Math.round(
    (dayPlan.completedNewTopics.length / dayPlan.newTopics.length) * 100
  );
}
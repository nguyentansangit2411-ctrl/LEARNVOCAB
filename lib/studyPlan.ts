import { DayPlan } from "./types";
import { getTopics, getAllProgress, getMeta } from "./storage";
import { addDays, format } from "date-fns";

export function generateStudyPlan(startDateStr: string): DayPlan[] {
  const topics = getTopics();
  const allProgress = getAllProgress();
  const startDate = new Date(startDateStr);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const today = new Date(todayStr);

  const plan: DayPlan[] = [];
  let topicIndex = 0;

  for (let day = 1; day <= 21; day++) {
    const dateObj = addDays(startDate, day - 1);
    const dateStr = format(dateObj, "yyyy-MM-dd");
    
    // Determine number of topics for this day
    // 50 topics total over 21 days
    let topicsForDay = 2;
    if (day <= 3 || (day >= 8 && day <= 10) || (day >= 15 && day <= 16)) {
      topicsForDay = 3; // 8 days * 3 = 24 topics
    } // 13 days * 2 = 26 topics. Total = 50.
    
    const newTopics: string[] = [];
    for (let i = 0; i < topicsForDay; i++) {
      if (topicIndex < topics.length) {
        newTopics.push(topics[topicIndex].id);
        topicIndex++;
      }
    }

    // Determine review words
    let reviewWords: string[] = [];
    if (dateStr <= todayStr) {
       reviewWords = Object.values(allProgress)
         .filter(p => p.nextReview === dateStr && p.status !== 'new')
         .map(p => p.wordId);
    }

    // Determine completed new topics
    const completedNewTopics = newTopics.filter(tId => {
      const topic = topics.find(t => t.id === tId);
      if (!topic || topic.words.length === 0) return false; // Not completed if no words
      return topic.words.every(w => {
         const p = allProgress[w.id];
         return p && p.status !== 'new';
      });
    });

    let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
    if (completedNewTopics.length === newTopics.length && newTopics.length > 0 && reviewWords.length === 0) {
      status = 'completed';
    } else if (completedNewTopics.length > 0 || (dateStr === todayStr && reviewWords.length === 0)) {
      status = 'in-progress'; // basic estimation
    }

    // For estimated minutes: 1.5 min per new word, 0.5 min per review word
    const estimatedMinutes = Math.round(newTopics.length * 12 * 1.5 + reviewWords.length * 0.5);

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
      status
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
  return Math.round((dayPlan.completedNewTopics.length / dayPlan.newTopics.length) * 100);
}

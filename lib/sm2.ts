import { WordProgress } from "./types";

export function updateSM2(progress: WordProgress, quality: 0 | 1 | 2 | 3 | 4 | 5): WordProgress {
  const today = new Date().toISOString().split('T')[0];
  let { interval, easeFactor, repetitions } = progress;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
    
    repetitions += 1;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReview = nextDate.toISOString().split('T')[0];

  return {
    ...progress,
    interval,
    easeFactor,
    repetitions,
    lastReview: today,
    nextReview,
    status: interval >= 7 ? 'known' : (repetitions > 0 ? 'learning' : 'new')
  };
}

export function getDueWords(allProgress: WordProgress[]): WordProgress[] {
  const today = new Date().toISOString().split('T')[0];
  return allProgress.filter(p => p.nextReview <= today && p.status !== 'new');
}

export interface Word {
  id: string;
  word: string;
  type: string;
  vietnamese: string;
  definition: string;
  example: string;
}

export interface Topic {
  id: string;
  name: string;
  nameVi: string;
  order: number;
  words: Word[];
  createdAt: string;
}

export interface WordProgress {
  wordId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
  lastReview: string;
  status: 'new' | 'learning' | 'known';
}

export interface StudyMeta {
  startDate: string;
  lastStudyDate: string;
  streak: number;
  totalReviewed: number;
  emailJS_serviceId: string;
  emailJS_templateId: string;
  emailJS_publicKey: string;
  userEmail: string;
}

export interface DayPlan {
  day: number;
  date: string;
  newTopics: string[];
  reviewWords: string[];
  estimatedMinutes: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  completedNewTopics: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

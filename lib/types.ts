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
  level: 1 | 2 | 3 | 4;       // mức độ nhớ hiện tại
  consecutiveCorrect: number;   // số lần đúng liên tiếp trong level hiện tại
  consecutiveWrong: number;     // số lần sai liên tiếp
  totalReviews: number;         // tổng số lần đã ôn
  lastReview: string;           // ISO date string
  firstLearnedAt: string;       // ngày học lần đầu
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

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DayPlan, StudyMeta } from '@/lib/types';
import { getMeta } from '@/lib/storage';
import { generateStudyPlan } from '@/lib/studyPlan';
import { ChevronLeft } from 'lucide-react';
import StudyPlanDay from '@/components/StudyPlanDay';

export default function PlanPage() {
  const [meta, setMeta] = useState<StudyMeta | null>(null);
  const [plan, setPlan] = useState<DayPlan[]>([]);

  useEffect(() => {
    const m = getMeta();
    setMeta(m);
    if (m.startDate) {
      setPlan(generateStudyPlan(m.startDate));
    }
  }, []);

  if (!meta) return null;

  if (!meta.startDate) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-serif text-text mb-4">Lộ trình học tập</h1>
        <p className="text-text-muted mb-8">Bạn chưa bắt đầu học. Hãy quay lại trang chủ để bắt đầu!</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold shadow-lg shadow-primary/20">
          Về trang chủ
        </Link>
      </main>
    );
  }

  const completedDays = plan.filter(p => p.status === 'completed').length;
  const progress = Math.round((completedDays / 21) * 100);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-text">Lộ trình 21 ngày</h1>
        </div>
      </header>

      <div className="bg-surface border border-border p-5 rounded-xl mb-8 shadow-xl">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-muted">Hoàn thành</span>
          <span className="font-mono font-bold text-text">{completedDays}/21 ngày ({progress}%)</span>
        </div>
        <div className="w-full bg-bg rounded-full h-3">
          <div className="bg-success h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="space-y-4">
        {plan.map(dayPlan => (
          <StudyPlanDay key={dayPlan.day} plan={dayPlan} />
        ))}
      </div>
    </main>
  );
}

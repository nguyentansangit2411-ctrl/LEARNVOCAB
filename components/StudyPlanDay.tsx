"use client";

import Link from 'next/link';
import { DayPlan } from '@/lib/types';
import { Clock, BookOpen, RefreshCw } from 'lucide-react';
import { getTopics } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { Topic } from '@/lib/types';

export default function StudyPlanDay({ plan }: { plan: DayPlan }) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    setTopics(getTopics());
  }, []);

  const newTopicNames = plan.newTopics.map(id => topics.find(t => t.id === id)?.name).filter(Boolean);

  let statusColor = "border-border bg-surface";
  let statusText = "🔒 Chưa đến";
  
  if (plan.status === 'completed') {
    statusColor = "border-success bg-success/5";
    statusText = "✅ Hoàn thành";
  } else if (plan.isToday || plan.status === 'in-progress') {
    statusColor = "border-primary bg-primary/5 ring-1 ring-primary";
    statusText = plan.isToday ? "🔥 Hôm nay" : "Đang học";
  } else if (plan.isPast) {
    statusColor = "border-border bg-surface opacity-60";
    statusText = "⚠️ Bỏ lỡ";
  }

  // Calculate remaining topics to learn
  const nextTopicId = plan.newTopics.find(t => !plan.completedNewTopics.includes(t));

  return (
    <div className={`p-4 sm:p-5 rounded-xl border relative transition-all ${statusColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <h3 className="font-bold text-lg text-text">
          Ngày {plan.day} <span className="mx-2 text-text-muted">&middot;</span> <span className="font-normal text-text-muted">{plan.date}</span>
        </h3>
        <span className="text-sm font-medium px-3 py-1 bg-surface-2 rounded-full w-fit">
          {statusText}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-text-muted">
          <BookOpen size={18} className="text-info shrink-0 mt-0.5" />
          <div>
            <span className="text-text">Học mới:</span> {newTopicNames.length > 0 ? newTopicNames.join(", ") : "Không có"} 
            {plan.newTopics.length > 0 && <span className="ml-1 opacity-70">({plan.newTopics.length * 12} từ)</span>}
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-text-muted">
          <RefreshCw size={18} className="text-warning shrink-0 mt-0.5" />
          <div>
            <span className="text-text">Ôn lại:</span> {plan.reviewWords.length} từ
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock size={18} className="text-success shrink-0" />
          <span>~{plan.estimatedMinutes} phút</span>
        </div>
      </div>

      {(plan.isToday || plan.status === 'in-progress') && (
        <div className="flex flex-wrap gap-3 mt-4">
          {nextTopicId && (
            <Link href={`/topic/${nextTopicId}`} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Học bài mới →
            </Link>
          )}
          {plan.reviewWords.length > 0 && (
            <Link href="/review" className="bg-warning hover:bg-warning/80 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Ôn tập ngay →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

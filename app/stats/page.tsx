"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topic, StudyMeta, WordProgress } from '@/lib/types';
import { getTopics, getAllProgress, getMeta } from '@/lib/storage';
import { ChevronLeft, Flame, Book, CheckCircle, Clock } from 'lucide-react';

export default function StatsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progresses, setProgresses] = useState<Record<string, WordProgress>>({});
  const [meta, setMeta] = useState<StudyMeta | null>(null);

  useEffect(() => {
    setTopics(getTopics());
    setProgresses(getAllProgress());
    setMeta(getMeta());
  }, []);

  if (!meta) return null;

  const allWords = topics.flatMap(t => t.words.map(w => ({ ...w, topicName: t.name })));
  const totalWords = allWords.length;
  
  const known = Object.values(progresses).filter(p => p.status === 'known').length;
  const learning = Object.values(progresses).filter(p => p.status === 'learning').length;
  const newWordsCount = totalWords - known - learning;

  const today = new Date().toISOString().split('T')[0];
  const dueToday = Object.values(progresses).filter(p => p.nextReview <= today && p.status !== 'new').length;

  // Find top forgotten words (lowest easeFactor)
  const hardWordsProgress = Object.values(progresses)
    .filter(p => p.status !== 'new')
    .sort((a, b) => a.easeFactor - b.easeFactor)
    .slice(0, 10);
    
  const hardWords = hardWordsProgress.map(p => {
    const w = allWords.find(word => word.id === p.wordId);
    return { ...p, wordStr: w?.word, vietnamese: w?.vietnamese, topic: w?.topicName };
  }).filter(w => w.wordStr);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-text">Thống kê</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border p-5 rounded-xl flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{meta.streak}</div>
            <div className="text-xs text-text-muted">Ngày liên tiếp</div>
          </div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-info/10 text-info rounded-xl flex items-center justify-center">
            <Book size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{learning + known}</div>
            <div className="text-xs text-text-muted">Từ đã học</div>
          </div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{known}</div>
            <div className="text-xs text-text-muted">Từ đã nhớ (≥7 ngày)</div>
          </div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{dueToday}</div>
            <div className="text-xs text-text-muted">Cần ôn hôm nay</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Biểu đồ tròn đơn giản bằng CSS */}
        <div className="bg-surface border border-border p-6 rounded-xl flex flex-col items-center shadow-lg">
          <h2 className="text-lg font-bold text-text mb-6 self-start">Tỷ lệ ghi nhớ</h2>
          <div className="relative w-48 h-48 rounded-full mb-6 flex items-center justify-center bg-surface-2 overflow-hidden shadow-inner" 
               style={{ 
                 background: `conic-gradient(var(--success) 0% ${(known/totalWords)*100 || 0}%, var(--warning) ${(known/totalWords)*100 || 0}% ${((known+learning)/totalWords)*100 || 0}%, var(--surface-2) ${((known+learning)/totalWords)*100 || 0}% 100%)`
               }}>
            <div className="absolute inset-0 m-4 bg-surface rounded-full flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-text">{totalWords > 0 ? Math.round((known / totalWords) * 100) : 0}%</span>
              <span className="text-xs text-text-muted">Đã nhớ</span>
            </div>
          </div>
          <div className="w-full flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> <span className="text-text-muted">Đã nhớ ({known})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div> <span className="text-text-muted">Đang học ({learning})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-surface-2 border border-border"></div> <span className="text-text-muted">Chưa học ({newWordsCount})</span></div>
          </div>
        </div>

        {/* Top từ khó */}
        <div className="bg-surface border border-border p-6 rounded-xl flex flex-col shadow-lg">
          <h2 className="text-lg font-bold text-text mb-4">Các từ khó nhớ nhất</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[300px]">
            {hardWords.length === 0 ? (
              <div className="text-center py-8 text-text-muted">Chưa có đủ dữ liệu. Hãy học nhiều hơn!</div>
            ) : (
              hardWords.map((w, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-surface-2 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div>
                    <div className="font-bold text-text">{w.wordStr} <span className="text-xs font-normal text-text-muted ml-2">{w.vietnamese}</span></div>
                    <div className="text-xs text-primary mt-0.5">{w.topic}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-danger font-bold mb-1 bg-danger/10 px-2 py-0.5 rounded-md inline-block">Độ dễ: {w.easeFactor.toFixed(2)}</div>
                    <div className="text-[10px] text-text-muted">Ôn tiếp: {w.nextReview}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

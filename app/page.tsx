"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topic, DayPlan, StudyMeta } from '@/lib/types';
import { getTopics, getAllProgress, getMeta, updateMeta } from '@/lib/storage';
import { getTodayPlan } from '@/lib/studyPlan';
import { LEVEL_CONFIG } from '@/lib/levelSystem';
import TopicCard from '@/components/TopicCard';
import EmailReminder from '@/components/EmailReminder';
import ThemeToggle from '@/components/ThemeToggle';
import { Flame, Bell, Calendar, Settings, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [meta, setMeta] = useState<StudyMeta | null>(null);
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [progresses, setProgresses] = useState<any>({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    setTopics(getTopics());
    setProgresses(getAllProgress());
    const m = getMeta();
    setMeta(m);

    if (!m.startDate) {
      setShowStartModal(true);
    } else {
      setTodayPlan(getTodayPlan());
    }
  }, []);

  const handleStart = () => {
    const today = new Date().toISOString().split('T')[0];
    updateMeta({ startDate: today, lastStudyDate: today, streak: 1 });
    setMeta(getMeta());
    setTodayPlan(getTodayPlan());
    setShowStartModal(false);
  };

  if (!meta) return null;

  const allProgress = Object.values(progresses);
  const totalWords = topics.reduce((acc, t) => acc + (t.words?.length || 0), 0);
  
  const levels = LEVEL_CONFIG.map(cfg => ({
    ...cfg,
    count: allProgress.filter((p: any) => p.level === cfg.level).length,
  }));

  const totalLearned = allProgress.length;
  const notStarted = totalWords - totalLearned;
  const maxCount = Math.max(...levels.map(l => l.count), 1);
  const knownWords = levels.find(l => l.level === 4)?.count || 0;
  const overallProgress = totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-primary mb-1">TOEIC 600</h1>
          <p className="text-text-muted">Lộ trình 21 ngày &bull; Spaced Repetition</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <ThemeToggle />
          <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-sm font-medium">
            <Bell size={18} /> Nhắc nhở
          </button>
          <Link href="/manage" className="flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-sm font-medium">
            <Settings size={18} /> Quản lý
          </Link>
        </div>
      </header>

      {/* Banner Hôm nay */}
      {todayPlan && (
        <section className="bg-gradient-to-br from-surface to-surface-2 border border-border rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold">Ngày {todayPlan.day}/21</span>
                <span className="text-text-muted">{todayPlan.date}</span>
                <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-full text-sm font-bold">
                  <Flame size={16} /> {meta.streak}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text mb-4">Mục tiêu hôm nay</h2>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="block text-text-muted mb-1">Học từ mới</span>
                  <span className="text-xl font-bold text-info">{todayPlan.newTopics.length * 12} từ</span>
                </div>
                <div>
                  <span className="block text-text-muted mb-1">Ôn tập (SM-2)</span>
                  <span className="text-xl font-bold text-warning">{todayPlan.reviewWords.length} từ</span>
                </div>
                <div>
                  <span className="block text-text-muted mb-1">Ước tính</span>
                  <span className="text-xl font-bold text-success">~{todayPlan.estimatedMinutes} phút</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 min-w-[200px]">
              {todayPlan.newTopics.length > 0 && todayPlan.completedNewTopics.length < todayPlan.newTopics.length && (
                <Link href={`/topic/${todayPlan.newTopics[todayPlan.completedNewTopics.length]}`} className="w-full text-center py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  Bắt đầu học <ChevronRight size={18} />
                </Link>
              )}
              {todayPlan.reviewWords.length > 0 && (
                <Link href="/review" className="w-full text-center py-3 bg-warning text-black rounded-xl hover:bg-warning/80 transition-all font-bold flex items-center justify-center gap-2">
                  Ôn tập ngay <ChevronRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Progress & SRS Chart */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-xl font-bold text-text">Tiến độ tổng thể</h2>
          <Link href="/stats" className="text-primary hover:underline text-sm flex items-center gap-1">
            Xem thống kê chi tiết <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface border border-border p-6 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Từ vựng đã thuộc lòng (Level 4)</span>
              <span className="font-mono font-bold text-text">{knownWords} / {totalWords > 0 ? totalWords : 600} ({overallProgress}%)</span>
            </div>
            <div className="w-full bg-bg rounded-full h-3 mb-6">
              <div className="bg-success h-full rounded-full transition-all duration-1000 relative" style={{ width: `${overallProgress}%` }}>
                <div className="absolute inset-0 bg-white/20 w-full rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-white/40 skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm mt-4">
              <span className="text-text-muted flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-bg border border-border"></span> Chưa học</span>
              <span className="font-mono font-bold">{notStarted} từ</span>
            </div>
          </div>
          
          <div className="bg-surface border border-border p-6 rounded-xl flex flex-col justify-end min-h-[200px]">
            <div className="flex justify-between items-end gap-2 h-32 mb-4">
              {levels.map((lvl) => {
                const height = Math.max((lvl.count / maxCount) * 100, 4);
                return (
                  <div key={lvl.level} className="flex-1 flex flex-col justify-end items-center group relative">
                    <span className="text-xs font-mono font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6">{lvl.count}</span>
                    <div 
                      className={`w-full max-w-[40px] rounded-t-md transition-all duration-1000 ${lvl.bgClass} ${lvl.borderClass} border-t border-l border-r`}
                      style={{ height: `${height}%`, backgroundColor: lvl.color + '40' }}
                    ></div>
                    <div className="mt-2 text-center">
                      <span className="text-lg">{lvl.emoji}</span>
                      <div className="text-[10px] sm:text-xs text-text-muted truncate w-full max-w-[80px] mx-auto mt-1">{lvl.label} ({lvl.count})</div>
                      {lvl.level < 4 && (
                        <div className="text-[9px] text-text-muted mt-0.5 hidden sm:block whitespace-nowrap">
                          Cần {lvl.level === 1 ? 2 : lvl.level === 2 ? 3 : 4} lần đúng LT
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-text">50 Chủ đề TOEIC</h2>
          <Link href="/plan" className="text-primary hover:underline text-sm flex items-center gap-1">
            Xem lộ trình 21 ngày <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topics.map(topic => {
            const topicKnown = topic.words?.filter(w => progresses[w.id]?.level === 4).length || 0;
            const topicProgress = topic.words?.length > 0 ? Math.round((topic.words.filter(w => progresses[w.id] && progresses[w.id].level >= 1).length / topic.words.length) * 100) : 0;
            return (
              <TopicCard key={topic.id} topic={topic} progress={topicProgress} knownWords={topicKnown} />
            );
          })}
        </div>
      </section>

      <EmailReminder isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />

      {/* Onboarding Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-8 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} />
            </div>
            <h2 className="text-3xl font-serif text-text mb-3">Chào mừng bạn!</h2>
            <p className="text-text-muted mb-8 text-sm leading-relaxed">
              Bạn sắp bắt đầu lộ trình 21 ngày chinh phục 600 từ vựng TOEIC với thuật toán Spaced Repetition.
            </p>
            <button onClick={handleStart} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Bắt đầu học ngay hôm nay
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

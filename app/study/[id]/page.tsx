"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Topic, Word } from '@/lib/types';
import { getTopics, getWordProgress, updateWordProgress } from '@/lib/storage';
import { updateSM2 } from '@/lib/sm2';
import { ChevronLeft, Flag } from 'lucide-react';
import FlashCard from '@/components/FlashCard';
import ProgressBar from '@/components/ProgressBar';

export default function StudySession() {
  const params = useParams();
  const router = useRouter();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [wordsQueue, setWordsQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [results, setResults] = useState<{word: Word, quality: number}[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const topics = getTopics();
    const t = topics.find(t => t.id === params.id);
    if (t && t.words.length > 0) {
      setTopic(t);
      // Bắt đầu với tất cả các từ của bài
      setWordsQueue([...t.words]);
    }
  }, [params.id]);

  if (!topic) return <div className="p-8 text-center text-text-muted">Đang tải hoặc topic không có từ vựng...</div>;

  const currentWord = wordsQueue[currentIndex];
  const progress = Math.round((currentIndex / wordsQueue.length) * 100);

  const handleRate = (quality: 0|1|2|3|4|5) => {
    // Lưu kết quả cho session summary
    setResults(prev => [...prev, { word: currentWord, quality }]);
    
    // Cập nhật SM-2
    const currentProgress = getWordProgress(currentWord.id);
    const newProgress = updateSM2(currentProgress, quality);
    updateWordProgress(currentWord.id, newProgress);

    if (quality === 0) {
      // Từ "Quên" sẽ xuất hiện lại cuối session
      setWordsQueue(prev => [...prev, currentWord]);
    }

    if (currentIndex + 1 < wordsQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const ease = results.filter(r => r.quality === 5).length;
    const ok = results.filter(r => r.quality === 3).length;
    const hard = results.filter(r => r.quality === 2).length;
    const forgotten = results.filter(r => r.quality === 0).length;

    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-serif text-text mb-2">Hoàn thành!</h1>
          <p className="text-text-muted mb-8">Đã học {wordsQueue.length} lượt — {topic.name}</p>

          <div className="bg-surface-2 rounded-xl p-6 mb-8 text-left max-w-sm mx-auto space-y-4 border border-border">
            <h3 className="font-bold text-text flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Flag size={18} className="text-primary" /> Kết quả phiên học
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-text-muted flex items-center gap-2"><span className="text-xl">😊</span> Dễ</span>
              <span className="font-mono text-success font-bold">{ease} lượt</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted flex items-center gap-2"><span className="text-xl">🙂</span> Nhớ ra</span>
              <span className="font-mono text-info font-bold">{ok} lượt</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted flex items-center gap-2"><span className="text-xl">😕</span> Khó</span>
              <span className="font-mono text-warning font-bold">{hard} lượt</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted flex items-center gap-2"><span className="text-xl">😵</span> Quên</span>
              <span className="font-mono text-danger font-bold">{forgotten} lượt</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/" className="px-6 py-3 bg-surface-2 text-text rounded-xl hover:bg-border transition-colors font-medium">
              Về trang chủ
            </Link>
            <Link href="/plan" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold shadow-lg shadow-primary/20">
              Xem lộ trình
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[100dvh]">
      <header className="flex items-center justify-between mb-8 shrink-0">
        <button onClick={() => router.back()} className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 px-8">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>Từ {currentIndex + 1}/{wordsQueue.length}</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <FlashCard key={currentIndex} word={currentWord} onRate={handleRate} />
      </div>
    </main>
  );
}

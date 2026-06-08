"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Word } from '@/lib/types';
import { getTopics, getAllProgress, getWordProgress, updateWordProgress } from '@/lib/storage';
import { updateSM2, getDueWords } from '@/lib/sm2';
import { ChevronLeft, Flag } from 'lucide-react';
import FlashCard from '@/components/FlashCard';
import ProgressBar from '@/components/ProgressBar';

export default function ReviewSession() {
  const router = useRouter();
  
  const [wordsQueue, setWordsQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [results, setResults] = useState<{word: Word, quality: number}[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const topics = getTopics();
    const allProgressObj = getAllProgress();
    const allProgressArr = Object.values(allProgressObj);
    
    const dueProgress = getDueWords(allProgressArr);
    
    // Mix and get words
    const dueWordIds = dueProgress.map(p => p.wordId);
    
    const allWords = topics.flatMap(t => t.words);
    const dueWordsData = allWords.filter(w => dueWordIds.includes(w.id));
    
    // Shuffle
    const shuffled = [...dueWordsData].sort(() => Math.random() - 0.5);
    setWordsQueue(shuffled);
    setIsLoading(false);
  }, []);

  if (isLoading) return <div className="p-8 text-center text-text-muted flex h-screen items-center justify-center">Đang tải dữ liệu ôn tập...</div>;

  if (wordsQueue.length === 0 && !isFinished) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-text mb-4 text-success">Hoàn thành!</h1>
        <p className="text-text-muted mb-8 text-lg">Bạn không có từ nào cần ôn tập hôm nay.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold shadow-lg shadow-primary/20">
          Về trang chủ
        </Link>
      </main>
    );
  }

  const currentWord = wordsQueue[currentIndex];
  const progress = Math.round((currentIndex / wordsQueue.length) * 100);

  const handleRate = (quality: 0|1|2|3|4|5) => {
    setResults(prev => [...prev, { word: currentWord, quality }]);
    
    const currentProgress = getWordProgress(currentWord.id);
    const newProgress = updateSM2(currentProgress, quality);
    updateWordProgress(currentWord.id, newProgress);

    if (quality === 0) {
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
        <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-serif text-text mb-2">Đã ôn tập xong!</h1>
          <p className="text-text-muted mb-8">Bạn đã ôn lại {wordsQueue.length} lượt từ vựng hôm nay.</p>

          <div className="bg-surface-2 rounded-xl p-6 mb-8 text-left max-w-sm mx-auto space-y-4 border border-border shadow-inner">
            <h3 className="font-bold text-text flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Flag size={18} className="text-primary" /> Kết quả phiên ôn tập
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
            <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold shadow-lg shadow-primary/20">
              Về trang chủ
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
            <span>Ôn tập: {currentIndex + 1}/{wordsQueue.length}</span>
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

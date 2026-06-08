"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Word, Topic, WordProgress } from '@/lib/types';
import { getTopics, getAllProgress, getWordProgress, saveWordProgress } from '@/lib/storage';
import { updateLevel, sortWordsForReview } from '@/lib/levelSystem';
import { ChevronLeft, Flag, Settings2, Play } from 'lucide-react';
import TypingQuiz from '@/components/TypingQuiz';
import ProgressBar from '@/components/ProgressBar';

export default function ReviewSession() {
  const router = useRouter();
  
  // Setup state
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([1, 2]); // Mặc định ôn Level 1, 2
  
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [allProgress, setAllProgress] = useState<Record<string, WordProgress>>({});
  
  // Session state
  const [wordsQueue, setWordsQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{word: Word, quality: boolean}[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAllTopics(getTopics());
    setAllProgress(getAllProgress());
    setIsLoading(false);
  }, []);

  const handleStart = () => {
    let wordIds = Object.keys(allProgress);
    
    // Filter by levels (if empty, means all levels)
    if (selectedLevels.length > 0) {
      wordIds = wordIds.filter(id => selectedLevels.includes(allProgress[id].level));
    }
    
    // Filter by topic
    if (selectedTopic !== 'all') {
      const topic = allTopics.find(t => t.id === selectedTopic);
      if (topic) {
        const topicWordIds = new Set(topic.words.map(w => w.id));
        wordIds = wordIds.filter(id => topicWordIds.has(id));
      }
    }

    // Sort: level 1 → 4, trong cùng level lastReview cũ nhất lên trước
    const sortedWordIds = sortWordsForReview(wordIds, allProgress);
    
    // Map sang Word objects
    const allWords = allTopics.flatMap(t => t.words);
    const reviewQueue = sortedWordIds
      .map(id => allWords.find(w => w.id === id))
      .filter(Boolean) as Word[];
    
    setWordsQueue(reviewQueue);
    setHasStarted(true);
  };

  const handleRate = (quality: boolean) => {
    setResults(prev => [...prev, { word: wordsQueue[currentIndex], quality }]);
    
    const currentWord = wordsQueue[currentIndex];
    const currentProgress = getWordProgress(currentWord.id);
    
    // Yêu cầu của user: "nếu như quên thì sẽ bị tăng level lên" -> có thể user gõ nhầm chữ "hạ" thành "tăng". 
    // Tuy nhiên theo thiết kế logic của SRS, trả lời sai (quality=false) sẽ làm mức độ ưu tiên tăng lên (nghĩa là level hạ xuống). 
    // updateLevel(..., false) sẽ đảm nhiệm việc này (level down).
    const newProgress = updateLevel(currentProgress, quality);
    saveWordProgress(currentWord.id, newProgress);

    // Bắt buộc học lại từ sai ở cuối phiên
    if (quality === false) {
      setWordsQueue(prev => [...prev, currentWord]);
    }

    if (currentIndex + 1 < wordsQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-text-muted flex h-screen items-center justify-center">Đang tải dữ liệu...</div>;

  // Setup Screen
  if (!hasStarted) {
    const totalLearned = Object.keys(allProgress).length;
    
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-text">Tùy chọn Ôn tập</h1>
        </header>

        <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Cấu hình phiên học</h2>
              <p className="text-sm text-text-muted">Tổng số từ đã học: {totalLearned}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Chọn Level */}
            <div>
              <label className="block text-sm font-bold text-text mb-3">Chọn cấp độ muốn ôn</label>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(level => {
                  const isSelected = selectedLevels.includes(level);
                  const labels = {
                    1: 'Level 1: Mới học',
                    2: 'Level 2: Đang nhớ',
                    3: 'Level 3: Nhớ tốt',
                    4: 'Level 4: Thuộc lòng'
                  };
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedLevels(prev => 
                          prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
                        );
                      }}
                      className={`p-3 rounded-xl border text-left transition-colors flex items-center gap-2 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-surface-2 hover:border-primary/30'}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-primary border-primary' : 'border-text-muted bg-surface'}`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={`text-sm ${isSelected ? 'font-bold text-primary' : 'text-text'}`}>
                        {labels[level as keyof typeof labels]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedLevels.length === 0 && (
                <p className="text-xs text-info mt-2">Đang chọn ôn tất cả các cấp độ.</p>
              )}
            </div>

            {/* Chủ đề */}
            <div>
              <label className="block text-sm font-bold text-text mb-3">Chọn chủ đề</label>
              <select 
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl p-4 text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="all">Tất cả chủ đề</option>
                {allTopics.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.nameVi}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={totalLearned === 0}
            className="w-full mt-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors font-bold shadow-lg shadow-primary/20 flex justify-center items-center gap-2 text-lg"
          >
            <Play size={20} fill="currentColor" /> Bắt đầu ngay
          </button>
          
          {totalLearned === 0 && (
            <p className="text-center text-sm text-danger mt-3">Bạn chưa học từ nào. Hãy bắt đầu học từ mới trước!</p>
          )}
        </div>
      </main>
    );
  }

  // No words to review in selected configuration
  if (wordsQueue.length === 0 && !isFinished) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-text mb-4 text-success">Trống!</h1>
        <p className="text-text-muted mb-8 text-lg">Không có từ vựng nào phù hợp với tùy chọn của bạn để ôn tập lúc này.</p>
        <button onClick={() => setHasStarted(false)} className="px-6 py-3 bg-surface-2 border border-border text-text rounded-xl hover:bg-border transition-colors font-bold mb-4">
          Quay lại cấu hình
        </button>
      </main>
    );
  }

  // Finish Screen
  if (isFinished) {
    const remembered = results.filter(r => r.quality === true).length;
    const forgotten = results.filter(r => r.quality === false).length;

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
              <span className="text-text-muted flex items-center gap-2"><span className="text-xl">✅</span> Nhớ rồi</span>
              <span className="font-mono text-success font-bold">{remembered} lượt</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted flex items-center gap-2"><span className="text-xl">❌</span> Sai / Chưa nhớ</span>
              <span className="font-mono text-danger font-bold">{forgotten} lượt</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => setHasStarted(false)} className="px-6 py-3 bg-surface-2 border border-border text-text rounded-xl hover:bg-border transition-colors font-bold">
              Ôn tập tiếp
            </button>
            <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold shadow-lg shadow-primary/20">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentWord = wordsQueue[currentIndex];
  const progress = Math.round((currentIndex / wordsQueue.length) * 100);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[100dvh]">
      <header className="flex items-center justify-between mb-8 shrink-0">
        <button onClick={() => setHasStarted(false)} className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text" title="Dừng ôn tập">
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
        <TypingQuiz key={currentIndex} word={currentWord} onRate={handleRate} />
      </div>
    </main>
  );
}

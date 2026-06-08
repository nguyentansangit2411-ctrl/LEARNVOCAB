"use client";

import { useState } from 'react';
import { Word } from '@/lib/types';
import { Eye } from 'lucide-react';

interface FlashCardProps {
  word: Word;
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

export default function FlashCard({ word, onRate }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleRate = (e: React.MouseEvent, quality: 0|1|2|3|4|5) => {
    e.stopPropagation();
    onRate(quality);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-md mx-auto aspect-[3/4] relative perspective-1000">
      <div 
        className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full backface-hidden bg-surface border border-border rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-primary transition-colors" 
          onClick={() => setIsFlipped(true)}
        >
          <h2 className="text-4xl font-mono font-bold text-text mb-4">{word.word}</h2>
          <span className="text-lg text-text-muted">({word.type})</span>
          <div className="mt-auto flex items-center gap-2 text-primary animate-pulse">
            <Eye size={20} />
            <span>Chạm để xem nghĩa</span>
          </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-surface border border-border rounded-2xl rotate-y-180 flex flex-col p-6 shadow-[0_0_30px_rgba(108,99,255,0.1)]">
          <div className="text-center mb-6 pb-4 border-b border-border">
            <h2 className="text-3xl font-mono font-bold text-text mb-2">{word.word}</h2>
            <span className="text-sm text-text-muted">({word.type})</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xl font-bold text-primary mb-3">{word.vietnamese}</h3>
            {word.definition && (
              <p className="text-text-muted mb-4 text-sm leading-relaxed">{word.definition}</p>
            )}
            {word.example && (
              <div className="bg-surface-2 p-3 rounded-lg text-sm italic border-l-2 border-primary text-text">
                &quot;{word.example}&quot;
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-center text-sm text-text-muted mb-3">Bạn nhớ từ này ở mức nào?</p>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={(e) => handleRate(e, 0)} className="flex flex-col items-center justify-center py-3 px-1 rounded-lg bg-surface-2 hover:bg-danger/20 hover:text-danger transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">😵</span>
                <span className="text-[10px] sm:text-xs">Quên</span>
              </button>
              <button onClick={(e) => handleRate(e, 2)} className="flex flex-col items-center justify-center py-3 px-1 rounded-lg bg-surface-2 hover:bg-warning/20 hover:text-warning transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">😕</span>
                <span className="text-[10px] sm:text-xs">Khó</span>
              </button>
              <button onClick={(e) => handleRate(e, 3)} className="flex flex-col items-center justify-center py-3 px-1 rounded-lg bg-surface-2 hover:bg-info/20 hover:text-info transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🙂</span>
                <span className="text-[10px] sm:text-xs">Nhớ ra</span>
              </button>
              <button onClick={(e) => handleRate(e, 5)} className="flex flex-col items-center justify-center py-3 px-1 rounded-lg bg-surface-2 hover:bg-success/20 hover:text-success transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">😊</span>
                <span className="text-[10px] sm:text-xs">Dễ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

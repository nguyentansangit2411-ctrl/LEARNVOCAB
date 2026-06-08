"use client";

import { useState, useRef, useEffect } from 'react';
import { Word } from '@/lib/types';
import { Volume2, ArrowRight } from 'lucide-react';

interface TypingQuizProps {
  word: Word;
  onRate: (quality: boolean) => void;
}

export default function TypingQuiz({ word, onRate }: TypingQuizProps) {
  const [inputValue, setInputValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and when word changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setInputValue('');
    setIsAnswered(false);
    setIsCorrect(false);
  }, [word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !inputValue.trim()) return;

    const normalizedInput = inputValue.trim().toLowerCase();
    const normalizedWord = word.word.toLowerCase();
    
    const correct = normalizedInput === normalizedWord;
    setIsCorrect(correct);
    setIsAnswered(true);

    // If correct, maybe play pronunciation
    if (correct && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }

    // Auto next after 1.5 seconds so user can see feedback
    setTimeout(() => {
      onRate(correct);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto aspect-[3/4] relative">
      <div className={`w-full h-full bg-surface border rounded-2xl flex flex-col p-8 transition-colors duration-300 ${isAnswered ? (isCorrect ? 'border-success bg-success/5' : 'border-danger bg-danger/5') : 'border-border'}`}>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="text-sm text-primary font-bold mb-2 bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
            {word.type}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6">
            {word.vietnamese}
          </h2>
          
          {/* Definition hint if available */}
          {word.definition && !isAnswered && (
             <p className="text-sm text-text-muted italic mb-6">
               Gợi ý: {word.definition}
             </p>
          )}

          {isAnswered && (
            <div className={`mt-4 mb-6 transition-all duration-500 animate-in fade-in zoom-in-95 ${isCorrect ? 'text-success' : 'text-danger'}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-mono font-bold">{word.word}</span>
                <button 
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      const utterance = new SpeechSynthesisUtterance(word.word);
                      utterance.lang = 'en-US';
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="p-2 bg-surface text-text-muted rounded-full hover:text-primary transition-colors border border-border"
                  title="Phát âm"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <div className="text-lg font-bold">
                {isCorrect ? '✨ Chính xác!' : '❌ Chưa đúng!'}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAnswered}
              placeholder="Nhập từ tiếng Anh..."
              className={`w-full bg-surface-2 border rounded-xl py-4 pl-4 pr-12 text-lg font-mono focus:outline-none focus:ring-2 transition-all ${isAnswered ? (isCorrect ? 'border-success text-success' : 'border-danger text-danger line-through') : 'border-border focus:border-primary focus:ring-primary/20 text-text'}`}
              autoComplete="off"
              spellCheck="false"
              autoCapitalize="none"
              autoCorrect="off"
            />
            {!isAnswered && (
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-all"
              >
                <ArrowRight size={20} />
              </button>
            )}
          </form>
          {isAnswered && !isCorrect && (
            <p className="text-center text-xs text-text-muted mt-3 animate-pulse">
              Đang chuyển sang từ tiếp theo...
            </p>
          )}
          {isAnswered && isCorrect && (
            <p className="text-center text-xs text-success mt-3 animate-pulse">
              Tuyệt vời! Đang chuyển...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

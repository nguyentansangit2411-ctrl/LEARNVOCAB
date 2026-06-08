"use client";

import { Word, WordProgress } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

interface WordListProps {
  words: Word[];
  progresses: Record<string, WordProgress>;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
}

export default function WordList({ words, progresses, onEdit, onDelete }: WordListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">
        Chưa có từ vựng nào. Hãy thêm từ mới!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {words.map(word => {
        const p = progresses[word.id];
        const isKnown = p && p.level === 4;
        const isLearning = p && p.level >= 1 && p.level <= 3;
        
        let statusBadge = <span className="w-3 h-3 rounded-full bg-surface-2" title="Chưa học"></span>;
        if (isKnown) statusBadge = <span className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Đã thuộc lòng"></span>;
        else if (isLearning) statusBadge = <span className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]" title="Đang học"></span>;

        return (
          <div key={word.id} className="bg-surface border border-border p-4 rounded-xl flex flex-col hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {statusBadge}
                <h4 className="font-mono text-lg font-bold text-text">{word.word}</h4>
                <span className="text-xs text-text-muted px-2 py-0.5 bg-surface-2 rounded-md">{word.type}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(word)} className="p-1.5 text-text-muted hover:text-primary bg-surface-2 rounded-md transition-colors" title="Sửa">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(word.id)} className="p-1.5 text-text-muted hover:text-danger bg-surface-2 rounded-md transition-colors" title="Xóa">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <p className="text-primary font-medium mb-3">{word.vietnamese}</p>
            
            {(word.definition || word.example) && (
              <div className="mt-auto space-y-2 pt-3 border-t border-border">
                {word.definition && <p className="text-sm text-text-muted">{word.definition}</p>}
                {word.example && <p className="text-sm italic text-text border-l-2 border-primary/50 pl-2">&quot;{word.example}&quot;</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

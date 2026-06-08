"use client";

import { useState } from 'react';
import { Word } from '@/lib/types';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ImportWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (words: Omit<Word, 'id'>[]) => void;
}

export default function ImportWordsModal({ isOpen, onClose, onImport }: ImportWordsModalProps) {
  const [text, setText] = useState('');
  
  if (!isOpen) return null;

  const parseText = () => {
    if (!text.trim()) return [];
    
    const lines = text.split('\n');
    const parsed: Omit<Word, 'id'>[] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.split(/\||\t/).map(s => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        // Assume min columns: word, vietnamese OR word, type, vietnamese
        // Format: word | type | vietnamese | definition | example
        let word = parts[0];
        let type = 'n';
        let vietnamese = '';
        let definition = '';
        let example = '';

        if (parts.length === 2) {
          vietnamese = parts[1];
        } else if (parts.length >= 3) {
          type = parts[1] || 'n';
          vietnamese = parts[2];
          if (parts.length >= 4) definition = parts[3];
          if (parts.length >= 5) example = parts[4];
        }

        if (word && vietnamese) {
          parsed.push({ word, type, vietnamese, definition, example });
        }
      }
    }
    return parsed;
  };

  const parsedWords = parseText();

  const handleImport = () => {
    if (parsedWords.length > 0) {
      onImport(parsedWords);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            📋 Nhập nhiều từ
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text bg-surface-2 p-1.5 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="bg-surface-2 p-4 rounded-lg mb-4 text-sm text-text-muted border border-border">
            <p className="font-medium text-text mb-2">Định dạng nhập (mỗi dòng 1 từ, ngăn cách bằng tab hoặc dấu |):</p>
            <code className="block bg-bg p-2 rounded text-info mb-2">word | từ_loại | nghĩa_việt | định_nghĩa_anh | ví_dụ</code>
            <p className="mb-1">Ví dụ:</p>
            <pre className="bg-bg p-2 rounded text-xs overflow-x-auto custom-scrollbar">
contract | n | hợp đồng | a binding legal agreement | The contract was signed.{"\n"}
cancel | v | hủy bỏ | to call off | The meeting was cancelled.
            </pre>
          </div>

          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Paste nội dung vào đây..."
            className="w-full h-48 bg-surface-2 border border-border rounded-lg p-3 text-text font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar resize-none"
          ></textarea>
        </div>

        <div className="p-5 border-t border-border bg-surface rounded-b-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            {parsedWords.length > 0 ? (
              <span className="text-success flex items-center gap-1 font-medium"><CheckCircle2 size={18} /> Nhận diện được {parsedWords.length} từ</span>
            ) : text.trim().length > 0 ? (
              <span className="text-warning flex items-center gap-1 font-medium"><AlertTriangle size={18} /> Không tìm thấy từ hợp lệ</span>
            ) : (
              <span className="text-text-muted">Chưa có dữ liệu</span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-surface-2 text-text rounded-lg hover:bg-border transition-colors font-medium">
              Hủy
            </button>
            <button 
              onClick={handleImport} 
              disabled={parsedWords.length === 0} 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 font-medium shadow-lg shadow-primary/20"
            >
              Nhập {parsedWords.length > 0 ? parsedWords.length : ''} từ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

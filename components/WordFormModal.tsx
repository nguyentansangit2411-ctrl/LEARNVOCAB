"use client";

import { useState, useEffect } from 'react';
import { Word } from '@/lib/types';
import { X } from 'lucide-react';

interface WordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: Omit<Word, 'id'>, keepOpen: boolean) => void;
  initialData?: Word | null;
}

export default function WordFormModal({ isOpen, onClose, onSave, initialData }: WordFormModalProps) {
  const [word, setWord] = useState('');
  const [type, setType] = useState('n');
  const [vietnamese, setVietnamese] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setWord(initialData.word);
        setType(initialData.type);
        setVietnamese(initialData.vietnamese);
        setDefinition(initialData.definition);
        setExample(initialData.example);
      } else {
        setWord('');
        setType('n');
        setVietnamese('');
        setDefinition('');
        setExample('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, keepOpen: boolean) => {
    e.preventDefault();
    if (!word.trim() || !vietnamese.trim()) return;
    
    onSave({
      word: word.trim(),
      type,
      vietnamese: vietnamese.trim(),
      definition: definition.trim(),
      example: example.trim()
    }, keepOpen);

    if (keepOpen) {
      setWord('');
      setVietnamese('');
      setDefinition('');
      setExample('');
      document.getElementById("wordInput")?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-xl font-bold text-text">{initialData ? 'Sửa từ vựng' : 'Thêm từ mới'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text bg-surface-2 p-1.5 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-muted mb-1">Từ tiếng Anh <span className="text-danger">*</span></label>
              <input id="wordInput" autoFocus required type="text" value={word} onChange={e => setWord(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Từ loại</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="n">n</option>
                <option value="v">v</option>
                <option value="adj">adj</option>
                <option value="adv">adv</option>
                <option value="n/v">n/v</option>
                <option value="v/n">v/n</option>
                <option value="adj/n">adj/n</option>
                <option value="phrase">phrase</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Nghĩa tiếng Việt <span className="text-danger">*</span></label>
            <input required type="text" value={vietnamese} onChange={e => setVietnamese(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Định nghĩa (English) <span className="text-xs opacity-50 font-normal">Không bắt buộc</span></label>
            <textarea value={definition} onChange={e => setDefinition(e.target.value)} rows={2} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Câu ví dụ <span className="text-xs opacity-50 font-normal">Không bắt buộc</span></label>
            <textarea value={example} onChange={e => setExample(e.target.value)} rows={2} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            {!initialData && (
              <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={!word.trim() || !vietnamese.trim()} className="px-4 py-2 bg-surface-2 text-text rounded-lg hover:bg-border transition-colors disabled:opacity-50 font-medium">
                Lưu & Thêm tiếp
              </button>
            )}
            <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={!word.trim() || !vietnamese.trim()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 font-medium shadow-lg shadow-primary/20">
              {initialData ? 'Cập nhật' : 'Lưu & Đóng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

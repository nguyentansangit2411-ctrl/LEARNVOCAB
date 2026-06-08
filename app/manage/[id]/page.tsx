"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Topic, Word } from '@/lib/types';
import { getTopics, saveTopics } from '@/lib/storage';
import { ChevronLeft, Plus, Settings, Trash2 } from 'lucide-react';
import ImportWordsModal from '@/components/ImportWordsModal';

export default function ManageTopicWords() {
  const params = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Form states
  const [word, setWord] = useState('');
  const [type, setType] = useState('n');
  const [vietnamese, setVietnamese] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const topics = getTopics();
    const t = topics.find(t => t.id === params.id);
    if (t) {
      if (!t.words) t.words = [];
      setTopic(t);
    }
  }, [params.id]);

  if (!topic) return null;

  const saveToStorage = (updatedTopic: Topic) => {
    setTopic(updatedTopic);
    const all = getTopics();
    const idx = all.findIndex(t => t.id === updatedTopic.id);
    if (idx !== -1) {
      all[idx] = updatedTopic;
      saveTopics(all);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !vietnamese.trim()) return;

    const newWord: Word = {
      id: editingId || `${topic.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      word: word.trim(),
      type,
      vietnamese: vietnamese.trim(),
      definition: definition.trim(),
      example: example.trim()
    };

    let updatedWords = [...topic.words];
    if (editingId) {
      const idx = updatedWords.findIndex(w => w.id === editingId);
      if (idx !== -1) updatedWords[idx] = newWord;
    } else {
      updatedWords.push(newWord);
    }

    saveToStorage({ ...topic, words: updatedWords });
    
    // Reset form but keep focus
    setWord('');
    setVietnamese('');
    setDefinition('');
    setExample('');
    setEditingId(null);
    document.getElementById("wordInput")?.focus();
  };

  const handleEdit = (w: Word) => {
    setEditingId(w.id);
    setWord(w.word);
    setType(w.type);
    setVietnamese(w.vietnamese);
    setDefinition(w.definition);
    setExample(w.example);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa từ này?')) return;
    saveToStorage({ ...topic, words: topic.words.filter(w => w.id !== id) });
    if (editingId === id) {
      setEditingId(null);
      setWord('');
      setVietnamese('');
      setDefinition('');
      setExample('');
    }
  };

  const handleImport = (words: Omit<Word, 'id'>[]) => {
    const newWords = words.map(w => ({
      ...w,
      id: `${topic.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    saveToStorage({ ...topic, words: [...topic.words, ...newWords] });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/manage" className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text">Nhập từ vựng</h1>
            <p className="text-primary">{topic.name} - {topic.nameVi}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-sm font-medium">
            📋 Nhập nhiều từ
          </button>
          <Link href={`/topic/${topic.id}`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
            Xem danh sách
          </Link>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cột trái: Danh sách từ */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-5 shadow-lg flex flex-col h-[70vh]">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center justify-between">
            Đã nhập ({topic.words.length})
            {topic.words.length > 0 && <span className="text-xs font-normal text-success px-2 py-1 bg-success/10 rounded-md">Đã lưu tự động</span>}
          </h2>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {topic.words.length === 0 ? (
              <div className="text-center py-12 text-text-muted">Chưa có từ nào.</div>
            ) : (
              topic.words.map(w => (
                <div key={w.id} className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${editingId === w.id ? 'bg-primary/5 border-primary/50' : 'bg-surface-2 border-border hover:border-primary/30'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-text">{w.word}</span>
                      <span className="text-xs text-text-muted">({w.type})</span>
                    </div>
                    <div className="text-sm text-primary">{w.vietnamese}</div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => handleEdit(w)} className="p-1.5 text-text-muted hover:text-primary bg-bg rounded-md transition-colors" title="Sửa">
                      <Settings size={14} />
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="p-1.5 text-text-muted hover:text-danger bg-bg rounded-md transition-colors" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột phải: Form nhập */}
        <div className="w-full lg:w-[400px] shrink-0 bg-surface border border-border rounded-xl p-5 shadow-lg flex flex-col h-fit sticky top-8">
          <h2 className="text-lg font-bold text-text mb-4">{editingId ? 'Sửa từ vựng' : 'Thêm từ mới'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-1">Từ tiếng Anh <span className="text-danger">*</span></label>
                <input id="wordInput" required autoFocus type="text" value={word} onChange={e => setWord(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
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
              <label className="block text-sm font-medium text-text-muted mb-1">Định nghĩa (EN) <span className="text-xs opacity-50 font-normal">Tùy chọn</span></label>
              <textarea value={definition} onChange={e => setDefinition(e.target.value)} rows={2} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Câu ví dụ <span className="text-xs opacity-50 font-normal">Tùy chọn</span></label>
              <textarea value={example} onChange={e => setExample(e.target.value)} rows={2} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"></textarea>
            </div>

            <div className="pt-2 flex gap-3">
              {editingId && (
                <button type="button" onClick={() => {
                  setEditingId(null);
                  setWord('');
                  setVietnamese('');
                  setDefinition('');
                  setExample('');
                }} className="px-4 py-2 bg-surface-2 text-text rounded-lg hover:bg-border transition-colors font-medium">
                  Hủy
                </button>
              )}
              <button type="submit" disabled={!word.trim() || !vietnamese.trim()} className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                <Plus size={18} /> {editingId ? 'Cập nhật' : 'Lưu & Thêm tiếp'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ImportWordsModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onImport={handleImport} 
      />
    </main>
  );
}

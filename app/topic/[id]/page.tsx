"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Topic, Word } from '@/lib/types';
import { getTopics, getAllProgress, saveTopics } from '@/lib/storage';
import { ChevronLeft, Plus, Play } from 'lucide-react';
import WordList from '@/components/WordList';
import WordFormModal from '@/components/WordFormModal';
import ImportWordsModal from '@/components/ImportWordsModal';

export default function ViewTopic() {
  const params = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [progresses, setProgresses] = useState<any>({});
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  useEffect(() => {
    const topics = getTopics();
    const t = topics.find(t => t.id === params.id);
    if (t) {
      if (!t.words) t.words = [];
      setTopic(t);
    }
    setProgresses(getAllProgress());
  }, [params.id]);

  if (!topic) return null;

  const knownWords = topic.words.filter(w => progresses[w.id]?.status === 'known').length;

  const saveToStorage = (updatedTopic: Topic) => {
    setTopic(updatedTopic);
    const all = getTopics();
    const idx = all.findIndex(t => t.id === updatedTopic.id);
    if (idx !== -1) {
      all[idx] = updatedTopic;
      saveTopics(all);
    }
  };

  const handleSaveWord = (newWord: Omit<Word, 'id'>, keepOpen: boolean) => {
    let updatedWords = [...topic.words];
    if (editingWord) {
      const idx = updatedWords.findIndex(w => w.id === editingWord.id);
      if (idx !== -1) updatedWords[idx] = { ...newWord, id: editingWord.id };
    } else {
      updatedWords.push({
        ...newWord,
        id: `${topic.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    saveToStorage({ ...topic, words: updatedWords });
    
    if (!keepOpen) {
      setShowFormModal(false);
      setEditingWord(null);
    } else if (editingWord) {
      setShowFormModal(false);
      setEditingWord(null);
    }
  };

  const handleDeleteWord = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa từ này?')) return;
    saveToStorage({ ...topic, words: topic.words.filter(w => w.id !== id) });
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
          <Link href="/" className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text">{topic.name}</h1>
            <p className="text-text-muted">{topic.nameVi}</p>
          </div>
          <div className="ml-4 px-3 py-1 bg-surface-2 rounded-full text-sm font-medium text-text-muted">
            {knownWords}/{topic.words.length} đã nhớ
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setEditingWord(null); setShowFormModal(true); }} className="px-4 py-2 bg-surface-2 text-text rounded-lg hover:bg-border transition-colors text-sm font-medium flex items-center gap-1">
            <Plus size={16} /> Thêm từ
          </button>
          <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-surface-2 text-text rounded-lg hover:bg-border transition-colors text-sm font-medium">
            📋 Nhập nhiều từ
          </button>
          {topic.words.length > 0 && (
            <Link href={`/study/${topic.id}`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium shadow-lg shadow-primary/20 flex items-center gap-1">
              <Play size={16} /> Học flashcard
            </Link>
          )}
        </div>
      </header>

      <WordList 
        words={topic.words} 
        progresses={progresses}
        onEdit={(w) => { setEditingWord(w); setShowFormModal(true); }}
        onDelete={handleDeleteWord}
      />

      <WordFormModal 
        isOpen={showFormModal} 
        onClose={() => { setShowFormModal(false); setEditingWord(null); }}
        onSave={handleSaveWord}
        initialData={editingWord}
      />

      <ImportWordsModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </main>
  );
}

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topic } from '@/lib/types';
import { getTopics, getAllProgress } from '@/lib/storage';
import { ChevronLeft, Search, Edit3 } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

export default function ManageTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progresses, setProgresses] = useState<any>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    setTopics(getTopics());
    setProgresses(getAllProgress());
  }, []);

  const filtered = topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.nameVi.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-text">Quản lý Chủ đề</h1>
        </div>
      </header>

      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm chủ đề..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg pl-10 pr-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-sm text-text-muted">
                <th className="py-3 px-4 font-medium w-16 text-center">STT</th>
                <th className="py-3 px-4 font-medium">Tên chủ đề</th>
                <th className="py-3 px-4 font-medium w-24 text-center">Số từ</th>
                <th className="py-3 px-4 font-medium w-48">Tiến độ</th>
                <th className="py-3 px-4 font-medium w-48 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((topic, idx) => {
                const totalWords = topic.words?.length || 0;
                const knownWords = topic.words?.filter(w => progresses[w.id]?.status === 'known').length || 0;
                const progress = totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0;
                
                return (
                  <tr key={topic.id} className="border-b border-border hover:bg-surface-2/50 transition-colors">
                    <td className="py-4 px-4 text-text-muted text-center">{topic.order}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-text">{topic.name}</div>
                      <div className="text-sm text-text-muted">{topic.nameVi}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-mono font-medium ${totalWords === 0 ? 'bg-danger/10 text-danger' : totalWords < 12 ? 'bg-warning/10 text-warning' : 'bg-surface-2 text-text'}`}>
                        {totalWords}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar progress={progress} className="w-24" />
                        <span className="text-sm text-text-muted font-mono">{progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/topic/${topic.id}`} className="px-3 py-1.5 bg-surface-2 text-text-muted hover:text-text rounded-lg hover:bg-border transition-colors text-sm font-medium">
                          Xem
                        </Link>
                        <Link href={`/manage/${topic.id}`} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
                          <Edit3 size={14} /> Nhập từ
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              Không tìm thấy chủ đề nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { Topic } from '@/lib/types';
import ProgressBar from './ProgressBar';

const groupColors = [
  '#6c63ff', // Group 1: General Business
  '#3b82f6', // Group 2: Office
  '#f59e0b', // Group 3: Personnel
  '#22c55e', // Group 4: Purchasing
  '#8b5cf6', // Group 5: Finance
  '#f97316', // Group 6: Management
  '#ec4899', // Group 7: Restaurant/Events
  '#06b6d4', // Group 8: Travel
  '#10b981', // Group 9: Entertainment
  '#ef4444', // Group 10: Health
];

export default function TopicCard({ topic, progress, knownWords }: { topic: Topic, progress: number, knownWords: number }) {
  const groupIndex = Math.floor((topic.order - 1) / 5);
  const color = groupColors[groupIndex] || '#6c63ff';

  const totalWords = topic.words?.length || 0;
  const isComplete = knownWords > 0 && knownWords === totalWords;
  const hasStarted = totalWords > 0 && progress > 0;

  return (
    <Link href={`/topic/${topic.id}`} className="block h-full">
      <div className="bg-surface border border-border p-5 rounded-xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(108,99,255,0.2)] hover:-translate-y-1 h-full flex flex-col cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {topic.order}
          </div>
          <div className={`text-xs px-2 py-1 rounded-md ${isComplete ? 'bg-success/20 text-success' : hasStarted ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-text-muted'}`}>
            {isComplete ? 'Hoàn thành' : hasStarted ? 'Đang học' : 'Chưa học'}
          </div>
        </div>
        <h3 className="text-lg font-bold text-text mb-1 truncate" title={topic.name}>{topic.name}</h3>
        <p className="text-sm text-text-muted mb-auto truncate" title={topic.nameVi}>{topic.nameVi}</p>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-muted">Đã nhớ</span>
            <span className="font-mono text-text">{knownWords}/{totalWords}</span>
          </div>
          <ProgressBar progress={totalWords === 0 ? 0 : progress} />
        </div>
      </div>
    </Link>
  );
}

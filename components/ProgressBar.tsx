export default function ProgressBar({ progress, className = "" }: { progress: number, className?: string }) {
  return (
    <div className={`w-full bg-surface-2 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className="bg-primary h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
}

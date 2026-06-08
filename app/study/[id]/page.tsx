"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Topic, Word } from "@/lib/types";
import { getTopics, getWordProgress, updateWordProgress } from "@/lib/storage";
import { updateSM2 } from "@/lib/sm2";
import { ChevronLeft, Volume2, RotateCcw, Flag } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

// ─── Types ────────────────────────────────────────────────────────────────────

type RatingQuality = 0 | 2 | 3 | 5;

interface RatingResult {
  word: Word;
  quality: RatingQuality;
}

type CardState = "front" | "flipping" | "back" | "exiting";
type ExitDirection = "left" | "right";

// ─── Rating config ─────────────────────────────────────────────────────────

const RATINGS: {
  quality: RatingQuality;
  emoji: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
}[] = [
    {
      quality: 0,
      emoji: "😵",
      label: "Quên",
      sublabel: "Học lại ngay",
      color: "text-danger",
      bg: "bg-danger/10 hover:bg-danger/20",
      border: "border-danger/30 hover:border-danger/60",
    },
    {
      quality: 2,
      emoji: "😕",
      label: "Khó",
      sublabel: "Ôn lại ngày mai",
      color: "text-warning",
      bg: "bg-warning/10 hover:bg-warning/20",
      border: "border-warning/30 hover:border-warning/60",
    },
    {
      quality: 3,
      emoji: "🙂",
      label: "Nhớ ra",
      sublabel: "Ôn sau 3 ngày",
      color: "text-info",
      bg: "bg-info/10 hover:bg-info/20",
      border: "border-info/30 hover:border-info/60",
    },
    {
      quality: 5,
      emoji: "😊",
      label: "Dễ",
      sublabel: "Ôn sau 1 tuần",
      color: "text-success",
      bg: "bg-success/10 hover:bg-success/20",
      border: "border-success/30 hover:border-success/60",
    },
  ];

// ─── Speech helper ─────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// ─── FlashCard component ───────────────────────────────────────────────────

interface FlashCardProps {
  word: Word;
  cardState: CardState;
  exitDirection: ExitDirection;
  onFlip: () => void;
  onRate: (q: RatingQuality) => void;
  onUndo: (() => void) | null;
  currentIndex: number;
  totalWords: number;
  topicName: string;
}

function FlashCard({
  word,
  cardState,
  exitDirection,
  onFlip,
  onRate,
  onUndo,
  currentIndex,
  totalWords,
  topicName,
}: FlashCardProps) {
  const isFlipped = cardState === "back" || cardState === "exiting";
  const isExiting = cardState === "exiting";

  const exitClass = isExiting
    ? exitDirection === "right"
      ? "translate-x-[120%] opacity-0 rotate-6"
      : "-translate-x-[120%] opacity-0 -rotate-6"
    : "";

  return (
    <div
      className={`w-full flex flex-col gap-6 transition-all duration-500 ease-in-out ${exitClass}`}
      style={{ perspective: "1200px" }}
    >
      {/* Card */}
      <div
        className="relative w-full cursor-pointer"
        style={{ minHeight: "320px" }}
        onClick={cardState === "front" ? onFlip : undefined}
      >
        {/* Inner flip container */}
        <div
          className="w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "320px",
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-2xl border border-border bg-surface flex flex-col items-center justify-center p-8 gap-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Topic badge */}
            <span className="text-xs text-text-muted bg-surface-2 px-3 py-1 rounded-full border border-border">
              {topicName}
            </span>

            {/* Word */}
            <div className="text-center">
              <div className="font-mono text-5xl font-bold text-text tracking-tight leading-tight mb-2">
                {word.word}
              </div>
              {word.type && (
                <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {word.type}
                </span>
              )}
            </div>

            {/* Audio button */}
            <button
              onClick={e => {
                e.stopPropagation();
                speak(word.word);
              }}
              className="flex items-center gap-2 text-text-muted hover:text-text text-sm transition-colors px-4 py-2 rounded-lg hover:bg-surface-2"
            >
              <Volume2 size={16} />
              Nghe phát âm
            </button>

            {/* Hint */}
            <div className="flex items-center gap-2 text-text-muted/50 text-xs mt-4 animate-pulse">
              <span>Nhấn để xem nghĩa</span>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-2xl border border-primary/30 bg-surface flex flex-col p-8 gap-4 overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Word header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-2xl font-bold text-text">
                    {word.word}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      speak(word.word);
                    }}
                    className="text-text-muted hover:text-primary transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                  {word.type && (
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      {word.type}
                    </span>
                  )}
                </div>
                {/* Vietnamese meaning — most important */}
                <div className="text-2xl font-semibold text-text mt-1">
                  {word.vietnamese}
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Definition */}
            {word.definition && (
              <div className="space-y-1">
                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                  Định nghĩa
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                  {word.definition}
                </p>
              </div>
            )}

            {/* Example */}
            {word.example && (
              <div className="space-y-1">
                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                  Ví dụ
                </div>
                <p className="text-sm leading-relaxed text-text/80 italic border-l-2 border-primary/40 pl-3">
                  {word.example}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons — only visible on back */}
      <div
        className={`grid grid-cols-4 gap-2 transition-all duration-300 ${cardState === "back"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        {RATINGS.map(r => (
          <button
            key={r.quality}
            onClick={() => onRate(r.quality)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 active:scale-95 ${r.bg} ${r.border}`}
          >
            <span className="text-2xl leading-none">{r.emoji}</span>
            <span className={`text-xs font-bold ${r.color}`}>{r.label}</span>
            <span className="text-[10px] text-text-muted leading-tight text-center hidden sm:block">
              {r.sublabel}
            </span>
          </button>
        ))}
      </div>

      {/* Undo */}
      {onUndo && cardState === "front" && (
        <button
          onClick={onUndo}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors mx-auto py-2 px-4 rounded-lg hover:bg-surface-2"
        >
          <RotateCcw size={12} />
          Hoàn tác đánh giá trước
        </button>
      )}
    </div>
  );
}

// ─── Summary screen ────────────────────────────────────────────────────────

function SummaryScreen({
  results,
  topic,
  forgottenCount,
}: {
  results: RatingResult[];
  topic: Topic;
  forgottenCount: number;
}) {
  const ease = results.filter(r => r.quality === 5).length;
  const ok = results.filter(r => r.quality === 3).length;
  const hard = results.filter(r => r.quality === 2).length;
  const forgotten = results.filter(r => r.quality === 0).length;
  const uniqueWords = new Set(results.map(r => r.word.id)).size;

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto text-4xl">
          ✅
        </div>
        <div>
          <h1 className="text-3xl font-serif text-text mb-1">Hoàn thành!</h1>
          <p className="text-text-muted">
            {uniqueWords} từ · {topic.name}
            {forgottenCount > 0 && (
              <span className="ml-2 text-warning text-sm">
                ({forgottenCount} từ đã học lại)
              </span>
            )}
          </p>
        </div>

        <div className="bg-surface-2 rounded-xl p-5 text-left space-y-3 border border-border">
          <h3 className="font-bold text-text flex items-center gap-2 pb-2 border-b border-border">
            <Flag size={16} className="text-primary" /> Kết quả phiên học
          </h3>
          {[
            { emoji: "😊", label: "Dễ", count: ease, color: "text-success" },
            { emoji: "🙂", label: "Nhớ ra", count: ok, color: "text-info" },
            { emoji: "😕", label: "Khó", count: hard, color: "text-warning" },
            {
              emoji: "😵",
              label: "Quên",
              count: forgotten,
              color: "text-danger",
            },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-text-muted flex items-center gap-2">
                <span className="text-xl">{item.emoji}</span> {item.label}
              </span>
              <span className={`font-mono font-bold ${item.color}`}>
                {item.count} lượt
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-surface-2 text-text rounded-xl hover:bg-border transition-colors font-medium text-sm"
          >
            Về trang chủ
          </Link>
          <Link
            href="/review"
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold text-sm shadow-lg shadow-primary/20"
          >
            Ôn tập ngay
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function StudySession() {
  const params = useParams();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  // queue: các từ còn lại cần học trong session
  const [queue, setQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<RatingResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [forgottenCount, setForgottenCount] = useState(0);

  // Card animation state
  const [cardState, setCardState] = useState<CardState>("front");
  const [exitDirection, setExitDirection] = useState<ExitDirection>("right");

  // Undo: lưu state trước đó để hoàn tác
  const undoRef = useRef<{
    queue: Word[];
    index: number;
    results: RatingResult[];
    forgottenCount: number;
  } | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    const topics = getTopics();
    const t = topics.find(t => t.id === params.id);
    if (t && t.words.length > 0) {
      setTopic(t);
      setQueue([...t.words]);
    }
  }, [params.id]);

  const handleFlip = useCallback(() => {
    if (cardState !== "front") return;
    setCardState("flipping");
    // Short delay then show back
    setTimeout(() => setCardState("back"), 50);
    // Auto-speak on flip
    if (queue[currentIndex]) {
      speak(queue[currentIndex].word);
    }
  }, [cardState, queue, currentIndex]);

  const handleRate = useCallback(
    (quality: RatingQuality) => {
      if (cardState !== "back") return;
      const word = queue[currentIndex];

      // Save undo snapshot
      undoRef.current = {
        queue: [...queue],
        index: currentIndex,
        results: [...results],
        forgottenCount,
      };
      setCanUndo(true);

      // Persist SM-2
      const prev = getWordProgress(word.id);
      const updated = updateSM2(prev, quality);
      updateWordProgress(word.id, updated);

      // Record result
      const newResults = [...results, { word, quality }];
      setResults(newResults);

      // If forgotten → re-add at end of remaining queue
      const nextQueue = [...queue];
      if (quality === 0) {
        setForgottenCount(c => c + 1);
        nextQueue.push(word);
      }

      // Animate exit: good ratings → exit right, bad → exit left
      const dir: ExitDirection = quality >= 3 ? "right" : "left";
      setExitDirection(dir);
      setCardState("exiting");

      setTimeout(() => {
        if (currentIndex + 1 < nextQueue.length) {
          setQueue(nextQueue);
          setCurrentIndex(i => i + 1);
          setCardState("front");
        } else {
          setIsFinished(true);
        }
      }, 400);
    },
    [cardState, queue, currentIndex, results, forgottenCount]
  );

  const handleUndo = useCallback(() => {
    if (!undoRef.current) return;
    const snap = undoRef.current;

    // Revert SM-2 is tricky without storing old state, so we skip storage revert
    // but restore UI state perfectly
    setQueue(snap.queue);
    setCurrentIndex(snap.index);
    setResults(snap.results);
    setForgottenCount(snap.forgottenCount);
    setCardState("front");
    setCanUndo(false);
    undoRef.current = null;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (cardState === "front") handleFlip();
      }
      if (cardState === "back") {
        if (e.key === "1") handleRate(0);
        if (e.key === "2") handleRate(2);
        if (e.key === "3") handleRate(3);
        if (e.key === "4") handleRate(5);
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cardState, handleFlip, handleRate, handleUndo]);

  if (!topic) {
    return (
      <div className="p-8 text-center text-text-muted">
        Đang tải hoặc topic không có từ vựng...
      </div>
    );
  }

  if (isFinished) {
    return (
      <SummaryScreen
        results={results}
        topic={topic}
        forgottenCount={forgottenCount}
      />
    );
  }

  const currentWord = queue[currentIndex];
  if (!currentWord) return null;

  // Progress = số từ gốc đã qua (không tính repeated forgotten words)
  const originalTotal = topic.words.length;
  const originalDone = Math.min(currentIndex, originalTotal);
  const progress = Math.round((originalDone / originalTotal) * 100);

  // Hiển thị "X/Y" — X = vị trí trong queue, Y = tổng queue (kể cả từ học lại)
  const queueDisplay =
    queue.length > originalTotal
      ? `${currentIndex + 1}/${queue.length} (${queue.length - originalTotal} từ học lại)`
      : `${currentIndex + 1}/${originalTotal}`;

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span className="truncate">{topic.name}</span>
            <span className="shrink-0 ml-2 font-mono">{queueDisplay}</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </header>

      {/* Keyboard hint */}
      <div className="text-center text-xs text-text-muted/40 mb-4 hidden sm:block">
        Space = lật thẻ · 1/2/3/4 = đánh giá · Ctrl+Z = hoàn tác
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col justify-center">
        <FlashCard
          word={currentWord}
          cardState={cardState}
          exitDirection={exitDirection}
          onFlip={handleFlip}
          onRate={handleRate}
          onUndo={canUndo ? handleUndo : null}
          currentIndex={currentIndex}
          totalWords={originalTotal}
          topicName={topic.name}
        />
      </div>
    </main>
  );
}
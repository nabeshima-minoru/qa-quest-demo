'use client';

import { useState } from 'react';
import BaseButton from '@/components/common/BaseButton';
import QuizTimer from '@/components/quiz/QuizTimer';
import type { Question } from '@/types';

interface Props {
  question: Question;
  index: number;
  total: number;
  onAnswer: (selected: Question['correctAnswer'] | null, isCorrect: boolean) => void;
}

export default function QuizCard({ question, index, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<Question['correctAnswer'] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const submit = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const next = () => {
    onAnswer(selected, selected === question.correctAnswer);
  };

  const handleTimeout = () => {
    if (!revealed) setRevealed(true);
  };

  return (
    <article className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 space-y-5">
      <header className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-3)] uppercase tracking-widest">
          <span>
            Q {index + 1} / {total}
          </span>
          <span>{question.category}</span>
        </div>
        <h3 className="serif text-lg text-[var(--cream)] leading-snug">
          {question.questionText}
        </h3>
        <QuizTimer
          duration={question.timeLimitSec}
          onTimeout={handleTimeout}
          paused={revealed}
          resetKey={question.id}
        />
      </header>

      <div className="space-y-2">
        {question.choices.map((c) => {
          const isSelected = selected === c.key;
          const isCorrect = revealed && c.key === question.correctAnswer;
          const isWrong = revealed && isSelected && c.key !== question.correctAnswer;
          return (
            <button
              key={c.key}
              type="button"
              disabled={revealed}
              onClick={() => setSelected(c.key)}
              className={`w-full text-left p-3 border rounded-[var(--r-sm)] transition-all duration-150 ${
                isCorrect
                  ? 'bg-[var(--success-l)] border-[var(--success)]'
                  : isWrong
                    ? 'bg-[var(--danger-l)] border-[var(--danger)]'
                    : isSelected
                      ? 'bg-[var(--accent-l)] border-[var(--accent)]'
                      : 'bg-[var(--card2)] border-[var(--edge2)] hover:border-[var(--text-3)]'
              } disabled:cursor-default`}
            >
              <div className="flex gap-3 items-start">
                <span
                  className={`mono text-xs w-6 h-6 inline-flex items-center justify-center rounded-[var(--r-sm)] shrink-0 ${
                    isCorrect
                      ? 'bg-[var(--success)] text-[var(--cream)]'
                      : isWrong
                        ? 'bg-[var(--danger)] text-[var(--cream)]'
                        : isSelected
                          ? 'bg-[var(--accent)] text-[var(--cream)]'
                          : 'bg-[var(--card)] text-[var(--text-2)]'
                  }`}
                >
                  {c.key}
                </span>
                <span className="text-[13px] text-[var(--text)]">{c.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="bg-[var(--card2)] border border-[var(--edge)] rounded-[var(--r-sm)] p-3 text-[12px] text-[var(--text-2)] leading-relaxed">
          <span className="mono text-[10px] text-[var(--brass)] uppercase tracking-widest">
            Explanation · {question.jstqbSyllabus}
          </span>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}

      <div className="pt-1">
        {!revealed ? (
          <BaseButton fullWidth size="lg" disabled={!selected} onClick={submit}>
            回答する
          </BaseButton>
        ) : (
          <BaseButton fullWidth size="lg" variant="secondary" onClick={next}>
            {index + 1 < total ? '次の問題へ' : 'クイズを終える'}
          </BaseButton>
        )}
      </div>
    </article>
  );
}

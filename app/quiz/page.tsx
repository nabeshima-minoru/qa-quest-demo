'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuizCard from '@/components/quiz/QuizCard';
import BaseButton from '@/components/common/BaseButton';
import { pickRandomQuestions } from '@/data/questions';
import { useGameStore } from '@/lib/gameStore';
import type { Question } from '@/types';

const SET_SIZE = 5;

export default function QuizPage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const status = useGameStore((s) => s.status);
  const recordQuizResult = useGameStore((s) => s.recordQuizResult);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 問題セットをマウント時に固定
  useEffect(() => {
    setQuestions(pickRandomQuestions(SET_SIZE));
  }, []);

  const current = useMemo(() => questions[index], [questions, index]);

  const handleAnswer = (_sel: Question['correctAnswer'] | null, isCorrect: boolean) => {
    if (isCorrect) setCorrect((c) => c + 1);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      // 完了
      recordQuizResult(isCorrect ? correct + 1 : correct, questions.length);
      setFinished(true);
    }
  };

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">問題セット読み込み中...</p>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full text-center space-y-6 bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-8">
          <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
            JSTQB Quiz Result
          </p>
          <h2 className="serif text-3xl text-[var(--cream)]">
            {correct} / {questions.length}
          </h2>
          <p className="text-[var(--text-2)] text-sm">
            正答率 {Math.round((correct / questions.length) * 100)}%
            <br />
            最終スコアの 25% に反映されます。
          </p>
          <BaseButton
            size="lg"
            onClick={() => {
              if (status === 'completed') {
                router.push('/score');
              } else {
                router.push('/game');
              }
            }}
          >
            ゲームに戻る
          </BaseButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <header className="mb-6 text-center space-y-1">
        <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          JSTQB Foundation · Quick Test
        </p>
        <h1 className="serif text-2xl text-[var(--cream)]">学習チェック</h1>
      </header>
      {current && (
        <QuizCard
          question={current}
          index={index}
          total={questions.length}
          onAnswer={handleAnswer}
        />
      )}
    </main>
  );
}

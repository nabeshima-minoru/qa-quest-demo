'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import BaseButton from '@/components/common/BaseButton';
import { routes } from '@/data/routes';
import { useGameStore } from '@/lib/gameStore';
import { STAT_LABELS, STAT_COLORS } from '@/lib/constants';
import type { StatKey } from '@/types';

export default function RouteSelectPage() {
  const router = useRouter();
  const startSession = useGameStore((s) => s.startSession);
  const [selected, setSelected] = useState<string>('orthodox');

  const handleStart = () => {
    startSession(selected);
    router.push('/game');
  };

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <header className="mb-10 text-center space-y-2">
        <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          Step 1 of 1
        </p>
        <h1 className="serif text-3xl text-[var(--cream)]">キャリアルートを選ぶ</h1>
        <p className="text-[var(--text-2)] text-sm">
          初期ステータスにボーナスが入ります。あなたが歩む QA キャリアの色を決めてください。
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {routes.map((r) => {
          const isSelected = selected === r.id;
          const bonusEntries = Object.entries(r.initialBonus) as [StatKey, number][];
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={`text-left p-5 rounded-[var(--r)] border transition-all duration-150 ${
                isSelected
                  ? 'bg-[var(--accent-l)] border-[var(--accent)]'
                  : 'bg-[var(--card)] border-[var(--edge2)] hover:border-[var(--text-3)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="serif text-lg text-[var(--cream)] leading-tight">
                  {r.name}
                </h3>
                {isSelected && (
                  <span className="mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                    selected
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[var(--text-2)] leading-relaxed mb-3">
                {r.description}
              </p>
              {bonusEntries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {bonusEntries.map(([key, val]) => (
                    <span
                      key={key}
                      className="mono text-[10px] px-2 py-0.5 rounded-[var(--r-sm)]"
                      style={{
                        background: 'var(--card2)',
                        color: STAT_COLORS[key],
                        border: `1px solid ${STAT_COLORS[key]}66`,
                      }}
                    >
                      {STAT_LABELS[key]} +{val}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="mono text-[10px] text-[var(--text-3)]">
                  no initial bonus
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <BaseButton size="lg" onClick={handleStart} disabled={!selected}>
          このルートで始める
        </BaseButton>
        <Link href="/" className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] underline-offset-4 hover:underline">
          ← タイトルに戻る
        </Link>
      </div>
    </main>
  );
}

'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { BALANCE } from '@/lib/constants';

interface Act {
  id: number;
  name: string;
  subtitle: string;
  from: number;
  to: number;
  mood: 'calm' | 'rising' | 'tense' | 'climax';
}

const ACTS: Act[] = [
  { id: 1, name: '第一幕', subtitle: '見習いの一歩',     from: 1,  to: 10, mood: 'calm' },
  { id: 2, name: '第二幕', subtitle: '現場の試練',       from: 11, to: 25, mood: 'rising' },
  { id: 3, name: '第三幕', subtitle: '信頼の獲得',       from: 26, to: 40, mood: 'tense' },
  { id: 4, name: '最終幕', subtitle: '未来を切り拓く時', from: 41, to: 50, mood: 'climax' },
];

const MOOD_COLOR: Record<Act['mood'], string> = {
  calm:    'var(--st-comm)',
  rising:  'var(--brass)',
  tense:   'var(--st-mgmt)',
  climax:  'var(--accent)',
};

export default function ActBanner() {
  const turn = useGameStore((s) => s.currentTurn);

  const act = useMemo(
    () => ACTS.find((a) => turn >= a.from && turn <= a.to) ?? ACTS[0],
    [turn]
  );

  // 各幕の初ターン or 最終ターンで強調
  const isActStart = ACTS.some((a) => a.from === turn);
  const isFinalTurn = turn === BALANCE.MAX_TURNS;
  const emphasized = isActStart || isFinalTurn;

  const accent = MOOD_COLOR[act.mood];

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--r)] border transition-all duration-300 ${
        emphasized ? 'qa-act-emphasis' : ''
      }`}
      style={{
        background: `linear-gradient(90deg, ${accent}10 0%, transparent 100%)`,
        borderColor: emphasized ? accent : 'var(--edge2)',
        padding: emphasized ? '14px 18px' : '8px 14px',
      }}
    >
      {/* left accent strip */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0"
        style={{ width: emphasized ? 4 : 2, background: accent }}
      />
      <div className="flex items-baseline justify-between gap-3 pl-2">
        <div className="flex items-baseline gap-3 min-w-0">
          <span
            className="mono text-[10px] uppercase tracking-[0.3em] shrink-0"
            style={{ color: accent }}
          >
            Act {act.id}
          </span>
          <span
            className={`serif truncate ${emphasized ? 'text-base' : 'text-sm'}`}
            style={{ color: 'var(--cream)' }}
          >
            {act.name}「{act.subtitle}」
          </span>
        </div>
        <div className="mono text-[10px] shrink-0" style={{ color: 'var(--text-3)' }}>
          Turn {turn} / {BALANCE.MAX_TURNS}
          {isFinalTurn && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-[var(--r-sm)]"
              style={{
                background: 'var(--accent-l)',
                color: 'var(--accent)',
              }}
            >
              FINAL
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

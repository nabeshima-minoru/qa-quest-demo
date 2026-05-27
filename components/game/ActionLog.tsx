'use client';

import { useGameStore } from '@/lib/gameStore';

const QUALITY_LABEL = {
  optimal: '最適解',
  good: '良い',
  average: '平均',
  suboptimal: '準最適',
  poor: '悪手',
} as const;

const QUALITY_COLOR = {
  optimal: 'var(--brass)',
  good: 'var(--success)',
  average: 'var(--text-2)',
  suboptimal: 'var(--warn)',
  poor: 'var(--danger)',
} as const;

export default function ActionLog() {
  const log = useGameStore((s) => s.actionLog);
  const recent = log.slice(-6).reverse();

  if (recent.length === 0) {
    return (
      <div className="text-[11px] text-[var(--text-3)] italic">
        まだ行動の記録はありません。
      </div>
    );
  }

  return (
    <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
      {recent.map((l) => (
        <li
          key={`${l.turn}-${l.eventId}`}
          className="text-[11px] border-l-2 pl-3 py-1"
          style={{ borderColor: QUALITY_COLOR[l.quality] }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="mono text-[var(--text-3)]">T{l.turn}</span>
            <span
              className="mono text-[10px]"
              style={{ color: QUALITY_COLOR[l.quality] }}
            >
              {QUALITY_LABEL[l.quality]}
            </span>
          </div>
          <div className="text-[var(--text-2)] truncate">{l.eventTitle}</div>
          <div className="mono text-[10px] text-[var(--brass)]">
            +{l.expGain} EXP
          </div>
        </li>
      ))}
    </ul>
  );
}

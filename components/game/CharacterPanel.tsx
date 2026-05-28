'use client';

import { useMemo } from 'react';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import { BALANCE, STAT_COLORS, STAT_LABELS, requiredExp } from '@/lib/constants';
import { useGameStore } from '@/lib/gameStore';
import type { StatKey } from '@/types';

export default function CharacterPanel() {
  const {
    level,
    totalExp,
    currentRole,
    wallet,
    stats,
    currentTurn,
  } = useGameStore();

  const roleDef = useMemo(
    () => BALANCE.ROLES.find((r) => r.id === currentRole),
    [currentRole]
  );

  const nextExp = requiredExp(level + 1);
  const prevExp = level > 1 ? requiredExp(level) : 0;
  const expIntoLevel = Math.max(0, totalExp - prevExp);
  const expRequired = Math.max(1, nextExp - prevExp);

  const statKeys: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];

  return (
    <aside className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5 space-y-5">
      {/* Header */}
      <header className="pb-4 border-b border-[var(--edge)]">
        <div className="flex items-center gap-3">
          <PlayerAvatar role={currentRole} size={64} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-widest text-[var(--text-3)]">
              Role
            </div>
            <h2 className="serif text-lg text-[var(--cream)] leading-tight truncate">
              {roleDef?.name ?? 'テスター'}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--text-2)] pt-3">
          <span>
            Turn <span className="mono text-[var(--cream)]">{currentTurn}</span>{' '}
            / {BALANCE.MAX_TURNS}
          </span>
          <span className="mono">
            ¥{wallet.toLocaleString('ja-JP')}
          </span>
        </div>
      </header>

      {/* Level / EXP */}
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[11px] uppercase tracking-widest text-[var(--text-3)]">
            Level
          </div>
          <div className="mono text-lg text-[var(--cream)]">{level}</div>
        </div>
        <BaseProgressBar
          value={expIntoLevel}
          max={expRequired}
          color="var(--brass)"
          height={4}
        />
        <div className="text-[10px] mono text-[var(--text-3)] mt-1 text-right">
          {expIntoLevel} / {expRequired} EXP
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-[var(--text-3)]">
          Stats
        </div>
        {statKeys.map((key) => (
          <div key={key}>
            <BaseProgressBar
              value={stats[key]}
              max={BALANCE.STAT_CAP}
              color={STAT_COLORS[key]}
              showLabel
              label={STAT_LABELS[key]}
              height={5}
            />
          </div>
        ))}
      </section>
    </aside>
  );
}

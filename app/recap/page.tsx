'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/common/BaseButton';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import BossPortrait from '@/components/boss/BossPortrait';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import WeaponCard from '@/components/game/WeaponCard';
import { useGameStore } from '@/lib/gameStore';
import { BALANCE, STAT_COLORS, STAT_LABELS } from '@/lib/constants';
import { statSum } from '@/lib/successLogic';
import { findBossByChapter } from '@/data/successBosses';
import type { BattleResult, StatKey } from '@/types';

const STAT_ORDER: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];

interface ChapterMeta {
  title: string;
  subtitle: string;
  color: string;
}

const CHAPTER_META: Record<number, ChapterMeta> = {
  1: { title: '第1章「現場のいろは」', subtitle: '開発リーダーとの対峙', color: 'var(--st-comm)' },
  2: { title: '第2章「信頼を勝ち取れ」', subtitle: 'プロダクトマネージャーとの折衝', color: 'var(--brass)' },
  3: { title: '第3章「品質経営への道」', subtitle: 'CTO との最終決戦', color: 'var(--accent)' },
};

type Tier = 'win_strong' | 'win' | 'lose';

const COMMENTARY: Record<number, Record<Tier, string>> = {
  1: {
    win_strong:
      '危なげない勝利だった。基礎を着実に固め、現場での発言力も増してきた。良い滑り出しだ。',
    win:
      '苦しい場面もあったが、開発リーダーを説き伏せた。武器と経験を増やし、次の章に備えよう。',
    lose:
      '今回は押し負けた。だが立ち止まって武器を磨き直せば、後半で十分巻き返せる。焦るな。',
  },
  2: {
    win_strong:
      '見事な説得だった。技術だけでなくビジネスの言葉でも語れるようになってきた。視座が上がっている。',
    win:
      'プロダクトマネージャーを納得させた。経営層に近づく足場が固まりつつある。',
    lose:
      'まだ説得材料が足りなかった。知識と人脈の武器を補強し、もう一段の成長を狙おう。',
  },
  3: {
    win_strong:
      '完璧な締めくくり。全方位の武器を備えた君は、まさに QA 組織を率いるにふさわしい。',
    win:
      'CTO を唸らせ、最終決戦を制した。積み上げてきたものが実を結んだ瞬間だ。',
    lose:
      '最後の壁は高かった。それでも 36 週を走り抜いた経験は、確かな財産として残る。',
  },
};

function tierOf(result: BattleResult | undefined): Tier {
  if (!result || result.result === 'lose') return 'lose';
  const mentalRatio =
    result.playerMaxMental > 0 ? result.remainingMental / result.playerMaxMental : 0;
  return mentalRatio >= 0.6 ? 'win_strong' : 'win';
}

export default function RecapPage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const status = useGameStore((s) => s.status);
  const pendingRecap = useGameStore((s) => s.pendingRecap);
  const clearRecap = useGameStore((s) => s.clearRecap);
  const stats = useGameStore((s) => s.stats);
  const chapterStartStats = useGameStore((s) => s.chapterStartStats);
  const chapterGainedWeaponIds = useGameStore((s) => s.chapterGainedWeaponIds);
  const currentRole = useGameStore((s) => s.currentRole);
  const battleHistory = useGameStore((s) => s.battleHistory);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  // 総括対象が無ければ適切な画面へ
  useEffect(() => {
    if (!ready) return;
    if (pendingRecap !== null) return;
    if (status === 'idle') {
      router.replace('/');
    } else if (status === 'completed') {
      router.replace('/score');
    } else {
      router.replace('/game');
    }
  }, [ready, pendingRecap, status, router]);

  const chapter = pendingRecap;

  const gainedUnique = useMemo(
    () => Array.from(new Set(chapterGainedWeaponIds)),
    [chapterGainedWeaponIds]
  );

  if (chapter === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">読み込み中…</p>
      </main>
    );
  }

  const meta = CHAPTER_META[chapter] ?? CHAPTER_META[1];
  const boss = findBossByChapter(chapter);
  const battle = battleHistory.find((b) => b.chapter === chapter);
  const tier = tierOf(battle);
  const commentary = COMMENTARY[chapter]?.[tier] ?? '';
  const roleName = BALANCE.ROLES.find((r) => r.id === currentRole)?.name ?? 'テスター';
  const isFinal = chapter >= 3;

  const totalGrowth = statSum(stats) - statSum(chapterStartStats);

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-2 mb-8">
        <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          Chapter {chapter} Recap
        </p>
        <h1 className="serif text-3xl text-[var(--cream)]">章末総括</h1>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mono text-[11px] uppercase tracking-widest rounded-[var(--r-sm)]"
          style={{ color: meta.color, background: 'var(--card2)', border: `1px solid ${meta.color}` }}
        >
          <span>{meta.title}</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span style={{ color: 'var(--text)' }}>{meta.subtitle}</span>
        </div>
      </header>

      {/* Boss result */}
      {boss && (
        <section
          className="border rounded-[var(--r)] p-5 mb-6 flex items-center gap-4"
          style={{
            background: `linear-gradient(90deg, color-mix(in srgb, ${boss.themeColor} 14%, var(--card)) 0%, var(--card) 70%)`,
            borderColor: boss.themeColor,
          }}
        >
          <BossPortrait
            archetype={boss.archetype}
            color={boss.themeColor}
            hpRatio={battle ? battle.remainingBossHp / battle.bossMaxHp : 1}
            defeated={battle?.result === 'win'}
            escaped={battle?.result === 'lose'}
            size={96}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <p
              className="mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: boss.themeColor }}
            >
              Boss Battle · {battle?.result === 'win' ? 'Victory' : 'Retreat'}
            </p>
            <h3 className="serif text-base text-[var(--cream)]">
              {boss.title} {boss.name}
              <span className="ml-2 text-sm" style={{ color: boss.themeColor }}>
                {battle?.result === 'win' ? '撃破' : '撤退'}
              </span>
            </h3>
            {battle && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-2)] mono">
                <span>
                  ターン <span style={{ color: 'var(--cream)' }}>{battle.turnsTaken}</span>
                </span>
                <span>
                  残メンタル{' '}
                  <span style={{ color: 'var(--cream)' }}>
                    {battle.remainingMental}/{battle.playerMaxMental}
                  </span>
                </span>
                <span>
                  課題残 HP{' '}
                  <span style={{ color: 'var(--cream)' }}>
                    {battle.remainingBossHp}/{battle.bossMaxHp}
                  </span>
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick status */}
      <section className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3 text-center">
          <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">Role</div>
          <div className="serif text-base text-[var(--cream)] truncate">{roleName}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3 text-center">
          <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">総合力</div>
          <div className="serif text-base text-[var(--cream)]">{statSum(stats)}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3 text-center">
          <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">章の成長</div>
          <div className="serif text-base text-[var(--success)]">+{totalGrowth}</div>
        </div>
      </section>

      {/* Growth */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5 space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <PlayerAvatar role={currentRole} size={44} />
          <h2 className="serif text-base text-[var(--cream)]">この章の成長</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {STAT_ORDER.map((k) => {
            const delta = stats[k] - chapterStartStats[k];
            return (
              <div key={k}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12px] text-[var(--text)]">{STAT_LABELS[k]}</span>
                  <span className="mono text-[11px]">
                    <span className="text-[var(--text-2)]">{stats[k]}</span>
                    {delta !== 0 && (
                      <span style={{ color: delta > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {' '}
                        ({delta > 0 ? '+' : ''}
                        {delta})
                      </span>
                    )}
                  </span>
                </div>
                <BaseProgressBar
                  value={stats[k]}
                  max={BALANCE.STAT_CAP}
                  color={STAT_COLORS[k]}
                  height={5}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Weapons gained this chapter */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="serif text-base text-[var(--cream)]">この章で得た武器</h2>
          <span className="mono text-[11px] text-[var(--text-2)]">{gainedUnique.length} 種</span>
        </div>
        {gainedUnique.length === 0 ? (
          <p className="text-[12px] text-[var(--text-3)]">この章では新たな武器を得られなかった。</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {gainedUnique.map((id) => (
              <WeaponCard key={id} weaponId={id} compact showPassive={false} />
            ))}
          </div>
        )}
      </section>

      {/* Commentary */}
      <section
        className="border rounded-[var(--r)] p-6 mb-8"
        style={{ background: 'var(--card2)', borderColor: meta.color }}
      >
        <p
          className="mono text-[10px] uppercase tracking-[0.3em] mb-3"
          style={{ color: meta.color }}
        >
          Mentor&rsquo;s note · 総括
        </p>
        <p className="serif text-[15px] text-[var(--cream)] leading-relaxed">{commentary}</p>
      </section>

      {/* CTA */}
      <div className="text-center">
        <BaseButton
          size="lg"
          onClick={() => {
            clearRecap();
            router.push(isFinal ? '/score' : '/game');
          }}
        >
          {isFinal ? '最終結果を見る' : '次の章へ進む'}
        </BaseButton>
        {!isFinal && (
          <p className="mt-3 text-[11px] text-[var(--text-3)]">第{chapter + 1}章から再開します</p>
        )}
      </div>
    </main>
  );
}

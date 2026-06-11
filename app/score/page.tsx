'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SkillRadar from '@/components/score/SkillRadar';
import BaseButton from '@/components/common/BaseButton';
import BossPortrait from '@/components/boss/BossPortrait';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import { useGameStore } from '@/lib/gameStore';
import { BALANCE, STAT_LABELS } from '@/lib/constants';
import {
  calcFinalScore,
  effectiveStats,
  statSum,
  TOTAL_NORMAL_WEAPONS,
} from '@/lib/successLogic';
import { findRoute } from '@/data/routes';
import { findWeapon } from '@/data/weapons';
import { findBossById } from '@/data/successBosses';
import type { BattleResult, OwnedWeapon, ScoreResult, Stats, StatKey, WeaponRarity } from '@/types';

const RANK_DESCRIPTION: Record<string, string> = {
  S: '極めて優秀。QA 組織を率いるリーダーとして強く推薦。',
  A: '高水準で安定。即戦力・中核人材として推奨。',
  B: '標準より上。着実な成長を見せた。',
  C: '平均的な到達度。基礎は固まった。',
  D: '今後の伸びしろに期待。再挑戦を推奨。',
};

const RANK_COLOR: Record<string, string> = {
  S: 'var(--brass)',
  A: 'var(--accent)',
  B: 'var(--st-comm)',
  C: 'var(--text-2)',
  D: 'var(--text-3)',
};

const STAT_ORDER: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];

export default function ScorePage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const reset = useGameStore((s) => s.reset);
  const status = useGameStore((s) => s.status);
  const stats = useGameStore((s) => s.stats);
  const weapons = useGameStore((s) => s.weapons);
  const currentRole = useGameStore((s) => s.currentRole);
  const routeId = useGameStore((s) => s.routeId);
  const battleHistory = useGameStore((s) => s.battleHistory);
  const scoreResult = useGameStore((s) => s.scoreResult);

  const [copied, setCopied] = useState<'idle' | 'success' | 'error'>('idle');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (status === 'idle') {
      router.replace('/');
    }
  }, [ready, status, router]);

  const score = useMemo<ScoreResult>(() => {
    if (scoreResult) return scoreResult;
    return calcFinalScore({ stats, owned: weapons, battles: battleHistory, role: currentRole });
  }, [scoreResult, stats, weapons, battleHistory, currentRole]);

  const route = findRoute(routeId);
  const roleDef = BALANCE.ROLES.find((r) => r.id === currentRole);
  const eff = effectiveStats(stats, weapons);

  const wins = battleHistory.filter((b) => b.result === 'win').length;
  const normalOwned = useMemo(
    () => weapons.filter((w) => !w.id.startsWith('WPN-TROPHY')),
    [weapons],
  );
  const normalOwnedCount = normalOwned.length;
  const rarityCounts = useMemo(() => countRarities(normalOwned), [normalOwned]);

  const handleCopy = async () => {
    const text = buildSummary({
      score,
      stats,
      eff,
      currentRoleName: roleDef?.name ?? currentRole,
      routeName: route?.name ?? '—',
      weaponCount: normalOwnedCount,
      wins,
      battleHistory,
    });
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied('success');
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied('success');
      }
      setTimeout(() => setCopied('idle'), 2200);
    } catch {
      setCopied('error');
      setTimeout(() => setCopied('idle'), 2200);
    }
  };

  if (status === 'idle') return null;

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <header className="text-center mb-10 space-y-2">
        <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          Final Evaluation
        </p>
        <h1 className="serif text-3xl text-[var(--cream)]">最終評価</h1>
        <p className="text-[var(--text-2)] text-xs">
          {route?.name ?? '—'} · 全 {BALANCE.MAX_WEEKS} 週 / 3 章 走破
        </p>
      </header>

      {/* Rank hero */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-8 mb-6 text-center">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-2">
              Rank
            </div>
            <div className="serif text-7xl leading-none" style={{ color: RANK_COLOR[score.rank] }}>
              {score.rank}
            </div>
          </div>
          <div className="text-left">
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-2">
              Total Score
            </div>
            <div className="mono text-5xl text-[var(--cream)]">{score.finalScore.toFixed(1)}</div>
            <div className="mono text-[10px] text-[var(--text-3)] mt-1">/ 100.0</div>
          </div>
        </div>
        <p className="mt-6 text-[13px] text-[var(--text-2)]">{RANK_DESCRIPTION[score.rank]}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <PlayerAvatar role={currentRole} size={56} />
          <div className="text-left">
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">
              到達ロール
            </div>
            <div className="serif text-lg text-[var(--cream)]">
              {roleDef?.name ?? currentRole}
            </div>
            <div className="mono text-[10px] text-[var(--text-3)]">総合力 {statSum(stats)}</div>
          </div>
        </div>
      </section>

      {/* Breakdown + Radar */}
      <section className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-4">
            Score Breakdown
          </h3>
          <ul className="space-y-3 text-sm">
            <BreakdownRow
              label="能力成長"
              value={score.breakdown.growthScore}
              weight={BALANCE.SCORE_WEIGHTS.growth}
            />
            <BreakdownRow
              label="ボス撃破"
              value={score.breakdown.battleScore}
              weight={BALANCE.SCORE_WEIGHTS.battle}
            />
            <BreakdownRow
              label="武器コレクション"
              value={score.breakdown.collectionScore}
              weight={BALANCE.SCORE_WEIGHTS.collection}
            />
            <BreakdownRow
              label="到達ロール"
              value={score.breakdown.roleScore}
              weight={BALANCE.SCORE_WEIGHTS.role}
            />
          </ul>
        </div>

        <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 flex flex-col items-center">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-4 self-start">
            Skill Radar
          </h3>
          <SkillRadar stats={eff} size={260} />
        </div>
      </section>

      {/* Boss battle record */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 mb-6">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-4">
          Boss Battle Record
        </h3>
        {battleHistory.length === 0 ? (
          <p className="text-[12px] text-[var(--text-3)] italic">ボス戦の記録はありません。</p>
        ) : (
          <ul className="space-y-3">
            {battleHistory.map((b) => (
              <BossRecordRow key={b.chapter} battle={b} />
            ))}
            <li className="pt-3 border-t border-[var(--edge)] mono text-[11px] text-[var(--text-2)]">
              撃破 <span className="text-[var(--brass)]">{wins}</span> / 3 章
            </li>
          </ul>
        )}
      </section>

      {/* Arsenal summary */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 mb-8">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-4">
          Arsenal
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="武器コレクション"
            value={`${normalOwnedCount} / ${TOTAL_NORMAL_WEAPONS}`}
          />
          <StatCard label="SR" value={`${rarityCounts.SR} 種`} />
          <StatCard label="R" value={`${rarityCounts.R} 種`} />
          <StatCard label="N" value={`${rarityCounts.N} 種`} />
        </div>
      </section>

      {/* Final stats line */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {STAT_ORDER.map((k) => (
          <StatCard key={k} label={STAT_LABELS[k]} value={String(eff[k])} />
        ))}
      </section>

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <BaseButton size="lg" onClick={handleCopy}>
            {copied === 'success'
              ? 'コピーしました ✓'
              : copied === 'error'
                ? 'コピー失敗'
                : '結果をコピー'}
          </BaseButton>
          <BaseButton
            size="lg"
            variant="secondary"
            onClick={() => {
              reset();
              router.push('/route-select');
            }}
          >
            もう一度プレイする
          </BaseButton>
        </div>
        <Link
          href="/"
          className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] underline-offset-4 hover:underline"
        >
          タイトル画面へ
        </Link>
      </div>
    </main>
  );
}

/*──────────────────── helpers / partials ────────────────────*/

function countRarities(weapons: OwnedWeapon[]): Record<WeaponRarity, number> {
  const c: Record<WeaponRarity, number> = { N: 0, R: 0, SR: 0 };
  for (const o of weapons) {
    const w = findWeapon(o.id);
    if (w) c[w.rarity] += 1;
  }
  return c;
}

function BreakdownRow({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: number;
}) {
  const contribution = value * weight;
  return (
    <li>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[var(--text)]">{label}</span>
        <span className="mono text-[var(--text-2)] text-xs">
          {value.toFixed(1)} × {weight} ={' '}
          <span className="text-[var(--cream)]">{contribution.toFixed(1)}</span>
        </span>
      </div>
      <div className="w-full h-1 bg-[var(--card2)] rounded-[var(--r-sm)] overflow-hidden">
        <div className="h-full bg-[var(--brass)]" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </li>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-1 truncate">
        {label}
      </div>
      <div className="serif text-base text-[var(--cream)]">{value}</div>
    </div>
  );
}

function BossRecordRow({ battle }: { battle: BattleResult }) {
  const boss = findBossById(battle.bossId);
  if (!boss) return null;
  const win = battle.result === 'win';
  return (
    <li
      className="flex items-center gap-3 p-3 rounded-[var(--r-sm)] border"
      style={{
        borderColor: `color-mix(in srgb, ${boss.themeColor} 40%, transparent)`,
        background: `color-mix(in srgb, ${boss.themeColor} 8%, var(--card))`,
      }}
    >
      <BossPortrait
        archetype={boss.archetype}
        color={boss.themeColor}
        hpRatio={battle.remainingBossHp / battle.bossMaxHp}
        defeated={win}
        escaped={!win}
        size={56}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="mono text-[10px] uppercase tracking-widest"
            style={{ color: boss.themeColor }}
          >
            Chapter {battle.chapter}
          </span>
          <span
            className="mono text-[10px] uppercase tracking-widest"
            style={{ color: win ? 'var(--brass)' : 'var(--text-3)' }}
          >
            {win ? '✓ 撃破' : '× 撤退'}
          </span>
        </div>
        <div className="serif text-sm text-[var(--cream)] truncate">
          {boss.name}
          <span className="ml-2 text-[var(--text-3)] text-xs">{boss.title}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] mono text-[var(--text-2)] mt-1">
          <span>
            ターン <span style={{ color: 'var(--cream)' }}>{battle.turnsTaken}</span>
          </span>
          <span>
            残メンタル{' '}
            <span style={{ color: 'var(--cream)' }}>
              {battle.remainingMental}/{battle.playerMaxMental}
            </span>
          </span>
        </div>
      </div>
    </li>
  );
}

/*──────────────────── clipboard summary ────────────────────*/

interface SummaryInput {
  score: ScoreResult;
  stats: Stats;
  eff: Stats;
  currentRoleName: string;
  routeName: string;
  weaponCount: number;
  wins: number;
  battleHistory: BattleResult[];
}

function buildSummary(input: SummaryInput): string {
  const { score, eff, currentRoleName, routeName, weaponCount, wins, battleHistory } = input;
  const lines: string[] = [];
  lines.push(`QA Quest 最終評価 — Rank ${score.rank} (${score.finalScore.toFixed(1)} / 100)`);
  lines.push(`ルート: ${routeName}`);
  lines.push(`到達: ${currentRoleName}`);
  lines.push('');
  lines.push('【スコア内訳】');
  lines.push(
    `能力成長        ${score.breakdown.growthScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.growth} = ${(score.breakdown.growthScore * BALANCE.SCORE_WEIGHTS.growth).toFixed(1)}`
  );
  lines.push(
    `ボス撃破        ${score.breakdown.battleScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.battle} = ${(score.breakdown.battleScore * BALANCE.SCORE_WEIGHTS.battle).toFixed(1)}`
  );
  lines.push(
    `武器コレクション ${score.breakdown.collectionScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.collection} = ${(score.breakdown.collectionScore * BALANCE.SCORE_WEIGHTS.collection).toFixed(1)}`
  );
  lines.push(
    `到達ロール      ${score.breakdown.roleScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.role} = ${(score.breakdown.roleScore * BALANCE.SCORE_WEIGHTS.role).toFixed(1)}`
  );
  lines.push('');
  lines.push('【最終ステータス（武器込み）】');
  const statKeys: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];
  lines.push(statKeys.map((k) => `${STAT_LABELS[k]} ${eff[k]}`).join(' / '));
  lines.push('');
  if (battleHistory.length > 0) {
    lines.push('【ボス戦結果】');
    battleHistory.forEach((b) => {
      const boss = findBossById(b.bossId);
      if (!boss) return;
      const st = b.result === 'win' ? '✓ 撃破' : '× 撤退';
      lines.push(`第${b.chapter}章  ${boss.name}(${boss.title})  ${st}`);
    });
    lines.push('');
  }
  lines.push(`撃破 ${wins}/3章    武器コレクション ${weaponCount}/${TOTAL_NORMAL_WEAPONS}`);
  lines.push('');
  lines.push('▶ https://qa-quest-demo.vercel.app/');
  return lines.join('\n');
}

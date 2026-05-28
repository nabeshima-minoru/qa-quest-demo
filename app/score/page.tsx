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
import { calculateFinalScore } from '@/lib/gameLogic';
import { findRoute } from '@/data/routes';
import { findBossById } from '@/data/bosses';
import type { BossBattleState, ScoreResult, Stats, StatKey } from '@/types';

const RANK_DESCRIPTION: Record<string, string> = {
  S: '極めて優秀。即戦力・リーダー候補として強く推薦。',
  A: '高水準で安定。面接招待を強く推奨。',
  B: '標準より上。面接招待の候補。',
  C: '平均的なプレイヤー。招待を検討。',
  D: '今後の学習を期待。再挑戦を推奨。',
};

const RANK_COLOR: Record<string, string> = {
  S: 'var(--brass)',
  A: 'var(--accent)',
  B: 'var(--st-comm)',
  C: 'var(--text-2)',
  D: 'var(--text-3)',
};

export default function ScorePage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const reset = useGameStore((s) => s.reset);
  const state = useGameStore();
  const [copied, setCopied] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // セッションが無いか進行中ならゲーム or タイトルへ
  useEffect(() => {
    if (state.status === 'idle') {
      router.push('/');
    }
  }, [state.status, router]);

  // スコア結果（保存されていなければ計算）
  const score = useMemo(() => {
    if (state.scoreResult) return state.scoreResult;
    return calculateFinalScore({
      quizCorrect: state.quizCorrect,
      quizAttempted: state.quizAttempted,
      bugsFound: state.bugsFound,
      qualityWeightedSum: state.qualityWeightedSum,
      currentRole: state.currentRole,
    });
  }, [
    state.scoreResult,
    state.quizCorrect,
    state.quizAttempted,
    state.bugsFound,
    state.qualityWeightedSum,
    state.currentRole,
  ]);

  const route = findRoute(state.routeId);
  const roleDef = BALANCE.ROLES.find((r) => r.id === state.currentRole);
  const bossHistory = state.bossHistory ?? [];

  const handleCopy = async () => {
    const text = buildSummary({
      score,
      stats: state.stats,
      currentRoleName: roleDef?.name ?? state.currentRole,
      routeName: route?.name ?? '—',
      level: state.level,
      wallet: state.wallet,
      optimalCount: state.optimalCount,
      maxTurns: BALANCE.MAX_TURNS,
      quizCorrect: state.quizCorrect,
      quizAttempted: state.quizAttempted,
      bossHistory,
    });
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied('success');
      } else {
        // Fallback: legacy execCommand
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

  if (state.status === 'idle') {
    return null;
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <header className="text-center mb-10 space-y-2">
        <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          Final Evaluation
        </p>
        <h1 className="serif text-3xl text-[var(--cream)]">採用スコア</h1>
        <p className="text-[var(--text-2)] text-xs">
          {route?.name ?? '—'} · {BALANCE.MAX_TURNS} ターン完走
        </p>
      </header>

      {/* Rank Hero */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-8 mb-6 text-center">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-2">
              Rank
            </div>
            <div
              className="serif text-7xl leading-none"
              style={{ color: RANK_COLOR[score.rank] }}
            >
              {score.rank}
            </div>
          </div>
          <div className="text-left">
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-2">
              Total Score
            </div>
            <div className="mono text-5xl text-[var(--cream)]">
              {score.finalScore.toFixed(1)}
            </div>
            <div className="mono text-[10px] text-[var(--text-3)] mt-1">/ 100.0</div>
          </div>
        </div>
        <p className="mt-6 text-[13px] text-[var(--text-2)]">
          {RANK_DESCRIPTION[score.rank]}
        </p>

        {/* 到達ロール（アバター込み） */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <PlayerAvatar role={state.currentRole} size={56} />
          <div className="text-left">
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">
              到達ロール
            </div>
            <div className="serif text-lg text-[var(--cream)]">
              {roleDef?.name ?? state.currentRole}
            </div>
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
              label="JSTQB 正答率"
              value={score.breakdown.jstqbScore}
              weight={BALANCE.SCORE_WEIGHTS.jstqb}
            />
            <BreakdownRow
              label="バグ発見品質"
              value={score.breakdown.bugQualityAvg}
              weight={BALANCE.SCORE_WEIGHTS.bug}
            />
            <BreakdownRow
              label="選択肢の質"
              value={score.breakdown.choiceScore}
              weight={BALANCE.SCORE_WEIGHTS.choice}
            />
            <BreakdownRow
              label="到達ロール"
              value={score.breakdown.roleReachedScore}
              weight={BALANCE.SCORE_WEIGHTS.role}
            />
          </ul>
        </div>

        <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 flex flex-col items-center">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-4 self-start">
            Skill Radar
          </h3>
          <SkillRadar stats={state.stats} size={260} />
        </div>
      </section>

      {/* BOSS 戦結果セクション */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 mb-6">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-4">
          Boss Battle Record
        </h3>
        {bossHistory.length === 0 ? (
          <p className="text-[12px] text-[var(--text-3)] italic">
            BOSS 戦の記録はありません。
          </p>
        ) : (
          <ul className="space-y-3">
            {bossHistory.map((b) => (
              <BossRecordRow key={b.bossId} battle={b} />
            ))}
            <BossTotalsRow history={bossHistory} />
          </ul>
        )}
      </section>

      {/* Stats */}
      <section className="grid gap-3 md:grid-cols-4 mb-8">
        <StatCard label="最終レベル" value={`Lv ${state.level}`} />
        <StatCard
          label="最適解選択"
          value={`${state.optimalCount} / ${BALANCE.MAX_TURNS}`}
        />
        <StatCard
          label="JSTQB"
          value={
            state.quizAttempted > 0
              ? `${state.quizCorrect} / ${state.quizAttempted}`
              : '未受験'
          }
        />
        <StatCard
          label="最終資金"
          value={`¥${state.wallet.toLocaleString('ja-JP')}`}
        />
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
        <div
          className="h-full bg-[var(--brass)]"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </li>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-1">
        {label}
      </div>
      <div className="serif text-base text-[var(--cream)]">{value}</div>
    </div>
  );
}

function BossRecordRow({ battle }: { battle: BossBattleState }) {
  const boss = findBossById(battle.bossId);
  if (!boss) return null;
  const defeated = battle.result === 'defeated';
  const damage = battle.maxHp - battle.hp;
  const optimalCount = battle.log.filter((l) => l.quality === 'optimal').length;
  return (
    <li
      className="flex items-center gap-3 p-3 rounded-[var(--r-sm)] border"
      style={{
        borderColor: boss.themeColor + '55',
        background: `${boss.themeColor}10`,
      }}
    >
      <BossPortrait
        archetype={boss.archetype}
        color={boss.themeColor}
        hpRatio={battle.hp / battle.maxHp}
        defeated={defeated}
        escaped={!defeated}
        size={56}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="mono text-[10px] uppercase tracking-widest"
            style={{ color: boss.themeColor }}
          >
            Turn {battle.milestone}
          </span>
          <span
            className="mono text-[10px] uppercase tracking-widest"
            style={{
              color: defeated ? 'var(--brass)' : 'var(--text-3)',
            }}
          >
            {defeated ? '✓ 撃破' : '× 撤退'}
          </span>
        </div>
        <div className="serif text-sm text-[var(--cream)] truncate">
          {boss.name}
          <span className="ml-2 text-[var(--text-3)] text-xs">{boss.title}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] mono text-[var(--text-2)] mt-1">
          <span>
            与ダメ{' '}
            <span style={{ color: 'var(--cream)' }}>{damage}</span>
            <span className="text-[var(--text-3)]"> / {battle.maxHp}</span>
          </span>
          <span>
            最適 <span style={{ color: 'var(--brass)' }}>{optimalCount}</span>
          </span>
        </div>
      </div>
    </li>
  );
}

function BossTotalsRow({ history }: { history: BossBattleState[] }) {
  const defeats = history.filter((b) => b.result === 'defeated').length;
  const escapes = history.filter((b) => b.result === 'escaped').length;
  const totalDamage = history.reduce((s, b) => s + (b.maxHp - b.hp), 0);
  const totalOptimal = history.reduce(
    (s, b) => s + b.log.filter((l) => l.quality === 'optimal').length,
    0
  );
  return (
    <li className="pt-3 border-t border-[var(--edge)] mono text-[11px] text-[var(--text-2)]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <span>
          撃破 <span className="text-[var(--brass)]">{defeats}</span> / 4
        </span>
        <span>
          撤退 <span style={{ color: 'var(--text-3)' }}>{escapes}</span>
        </span>
        <span>
          与ダメ合計{' '}
          <span style={{ color: 'var(--cream)' }}>{totalDamage}</span>
        </span>
        <span>
          ボス戦最適解{' '}
          <span style={{ color: 'var(--brass)' }}>{totalOptimal}</span>
        </span>
      </div>
    </li>
  );
}

/*──────────────────── clipboard summary builder ────────────────────*/

interface SummaryInput {
  score: ScoreResult;
  stats: Stats;
  currentRoleName: string;
  routeName: string;
  level: number;
  wallet: number;
  optimalCount: number;
  maxTurns: number;
  quizCorrect: number;
  quizAttempted: number;
  bossHistory: BossBattleState[];
}

function buildSummary(input: SummaryInput): string {
  const {
    score,
    stats,
    currentRoleName,
    routeName,
    level,
    wallet,
    optimalCount,
    maxTurns,
    quizCorrect,
    quizAttempted,
    bossHistory,
  } = input;

  const lines: string[] = [];
  lines.push(
    `QA Quest 採用スコア — Rank ${score.rank} (${score.finalScore.toFixed(1)} / 100)`
  );
  lines.push(`ルート: ${routeName}`);
  lines.push(`到達: ${currentRoleName} (Lv ${level})`);
  lines.push('');
  lines.push('【スコア内訳】');
  lines.push(
    `JSTQB 正答率   ${score.breakdown.jstqbScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.jstqb} = ${(score.breakdown.jstqbScore * BALANCE.SCORE_WEIGHTS.jstqb).toFixed(1)}`
  );
  lines.push(
    `バグ発見品質   ${score.breakdown.bugQualityAvg.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.bug} = ${(score.breakdown.bugQualityAvg * BALANCE.SCORE_WEIGHTS.bug).toFixed(1)}`
  );
  lines.push(
    `選択肢の質    ${score.breakdown.choiceScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.choice} = ${(score.breakdown.choiceScore * BALANCE.SCORE_WEIGHTS.choice).toFixed(1)}`
  );
  lines.push(
    `到達ロール    ${score.breakdown.roleReachedScore.toFixed(1)} × ${BALANCE.SCORE_WEIGHTS.role} = ${(score.breakdown.roleReachedScore * BALANCE.SCORE_WEIGHTS.role).toFixed(1)}`
  );
  lines.push('');
  lines.push('【ステータス】');
  const statKeys: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];
  lines.push(statKeys.map((k) => `${STAT_LABELS[k]} ${stats[k]}`).join(' / '));
  lines.push('');
  if (bossHistory.length > 0) {
    lines.push('【BOSS 戦結果】');
    bossHistory.forEach((b) => {
      const boss = findBossById(b.bossId);
      if (!boss) return;
      const status = b.result === 'defeated' ? '✓ 撃破' : '× 撤退';
      const damage = b.maxHp - b.hp;
      lines.push(
        `Turn ${b.milestone}  ${boss.name}(${boss.title})  ${status}  与ダメ ${damage}/${b.maxHp}`
      );
    });
    lines.push('');
  }
  lines.push(
    `最適解選択: ${optimalCount}/${maxTurns}    JSTQB: ${quizAttempted > 0 ? `${quizCorrect}/${quizAttempted}` : '未受験'}    最終資金: ¥${wallet.toLocaleString('ja-JP')}`
  );
  lines.push('');
  lines.push('▶ https://qa-quest-demo.vercel.app/');
  return lines.join('\n');
}

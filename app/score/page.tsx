'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SkillRadar from '@/components/score/SkillRadar';
import BaseButton from '@/components/common/BaseButton';
import { useGameStore } from '@/lib/gameStore';
import { BALANCE } from '@/lib/constants';
import { calculateFinalScore } from '@/lib/gameLogic';
import { findRoute } from '@/data/routes';

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

      {/* Stats */}
      <section className="grid gap-3 md:grid-cols-4 mb-8">
        <StatCard label="到達ロール" value={roleDef?.name ?? state.currentRole} />
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
      </section>

      <div className="flex flex-col items-center gap-3">
        <BaseButton
          size="lg"
          onClick={() => {
            reset();
            router.push('/route-select');
          }}
        >
          もう一度プレイする
        </BaseButton>
        <Link href="/" className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] underline-offset-4 hover:underline">
          タイトル画面へ
        </Link>
      </div>
    </main>
  );
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

// ターン処理・抽選・スコア計算のロジック

import { BALANCE, requiredExp } from '@/lib/constants';
import { events } from '@/data/events';
import type {
  GameEvent,
  Stats,
  ChoiceEffects,
  Choice,
  RoleId,
  ScoreResult,
} from '@/types';

/** ステータスを CAP で頭打ちにする */
export function clampStat(value: number): number {
  return Math.max(0, Math.min(BALANCE.STAT_CAP, Math.floor(value)));
}

/** 効果を適用した新しいステータスを返す */
export function applyStatEffects(stats: Stats, effects: ChoiceEffects): Stats {
  return {
    tech: clampStat(stats.tech + (effects.tech ?? 0)),
    comm: clampStat(stats.comm + (effects.comm ?? 0)),
    analysis: clampStat(stats.analysis + (effects.analysis ?? 0)),
    mgmt: clampStat(stats.mgmt + (effects.mgmt ?? 0)),
    ai: clampStat(stats.ai + (effects.ai ?? 0)),
  };
}

/** 与えられたレベル・ステータスに基づき、最も高いロールを返す */
export function determineRole(level: number, stats: Stats): RoleId {
  // 上から順に判定（高い順）
  const rolesDesc = [...BALANCE.ROLES].reverse();
  for (const role of rolesDesc) {
    if (level >= role.minLevel && (!role.cond || role.cond(stats))) {
      return role.id;
    }
  }
  return 'tester';
}

/** EXP からレベルを再計算して、新 level と skillPoints 増分を返す */
export function calcLevelUp(
  currentLevel: number,
  totalExp: number
): { newLevel: number; spGain: number } {
  let level = currentLevel;
  let spGain = 0;
  while (totalExp >= requiredExp(level + 1)) {
    level += 1;
    spGain += BALANCE.SP_PER_LEVEL;
  }
  return { newLevel: level, spGain };
}

/** triggerConditions を満たすかどうかを判定 */
function meetsConditions(
  ev: GameEvent,
  ctx: {
    level: number;
    stats: Stats;
    role: RoleId;
    routeId: string;
    flags: Record<string, number>;
  }
): boolean {
  const c = ev.triggerConditions ?? {};
  if (c.minLevel !== undefined && ctx.level < c.minLevel) return false;
  if (c.maxLevel !== undefined && ctx.level > c.maxLevel) return false;
  if (c.roles && c.roles.length > 0 && !c.roles.includes(ctx.role)) return false;
  if (c.routes && c.routes.length > 0 && !c.routes.includes(ctx.routeId)) return false;
  if (c.stats) {
    for (const [k, v] of Object.entries(c.stats)) {
      if ((ctx.stats[k as keyof Stats] ?? 0) < (v as number)) return false;
    }
  }
  if (c.flags) {
    for (const flag of c.flags) {
      if (!(flag in ctx.flags)) return false;
    }
  }
  return true;
}

/** 重み付き乱択 */
function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((s, it) => s + Math.max(0, it.weight), 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let r = Math.random() * total;
  for (const it of items) {
    r -= Math.max(0, it.weight);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

/** 次に表示するイベントを抽選 */
export function pickNextEvent(ctx: {
  level: number;
  stats: Stats;
  role: RoleId;
  routeId: string;
  flags: Record<string, number>;
  usedEventIds: string[];
}): GameEvent | null {
  const eligible = events.filter(
    (e) => meetsConditions(e, ctx) && !ctx.usedEventIds.includes(e.id)
  );
  // 全部使い切ったらリセット（同一セッションでの繰り返し許可）
  const pool = eligible.length > 0 ? eligible : events.filter((e) => meetsConditions(e, ctx));
  return weightedRandom(pool);
}

/** 1 ターン分の EXP 計算 */
export function calcExpGain(choice: Choice): number {
  const base = choice.effects.exp ?? 0;
  const bonus = (choice.isOptimal ? BALANCE.OPTIMAL_BONUS : 0) + BALANCE.TURN_END_BONUS;
  return base + bonus;
}

/** 選択肢の質に応じた重みを返す */
export function getQualityWeight(choice: Choice): number {
  return BALANCE.QUALITY_WEIGHT[choice.quality] ?? 0;
}

/** 最終スコア計算（balance_tuning.md 6.5） */
export function calculateFinalScore(state: {
  quizCorrect: number;
  quizAttempted: number;
  bugsFound: number;
  qualityWeightedSum: number;
  currentRole: RoleId;
}): ScoreResult {
  const jstqbScore =
    state.quizAttempted > 0 ? (state.quizCorrect / state.quizAttempted) * 100 : 0;

  // バグ品質の簡易計算（デモ版はバグ仕込みアプリと統合しないため）
  const bugQualityAvg = Math.min(100, (state.bugsFound / 15) * 100);

  const choiceScore = (state.qualityWeightedSum / BALANCE.MAX_TURNS) * 100;

  const roleDef = BALANCE.ROLES.find((r) => r.id === state.currentRole);
  const roleReachedScore = roleDef?.score ?? 0;

  const w = BALANCE.SCORE_WEIGHTS;
  const finalScore =
    jstqbScore * w.jstqb +
    bugQualityAvg * w.bug +
    choiceScore * w.choice +
    roleReachedScore * w.role;

  const t = BALANCE.RANK_THRESHOLDS;
  const rank: ScoreResult['rank'] =
    finalScore >= t.S
      ? 'S'
      : finalScore >= t.A
        ? 'A'
        : finalScore >= t.B
          ? 'B'
          : finalScore >= t.C
            ? 'C'
            : 'D';

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    rank,
    breakdown: {
      jstqbScore: Math.round(jstqbScore * 10) / 10,
      bugQualityAvg: Math.round(bugQualityAvg * 10) / 10,
      choiceScore: Math.round(choiceScore * 10) / 10,
      roleReachedScore,
    },
  };
}

export function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// balance_tuning.md 第 6 章の調整パラメータをそのまま反映

import type { Stats, RoleId } from '@/types';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  minLevel: number;
  cond?: (stats: Stats) => boolean;
  score: number;
}

export const BALANCE = {
  MAX_TURNS: 50,
  STAT_CAP: 100,
  INITIAL_WALLET: 30000,
  INITIAL_STATS: { tech: 25, comm: 25, analysis: 25, mgmt: 15, ai: 15 } as Stats,
  TURN_END_BONUS: 10,
  OPTIMAL_BONUS: 30,
  EXP_CURVE_EXPONENT: 1.8,
  SP_PER_LEVEL: 3,

  // 選択肢の質 → 重み
  QUALITY_WEIGHT: {
    optimal: 1.0,
    good: 0.7,
    average: 0.4,
    suboptimal: 0.15,
    poor: 0.0,
  } as const,

  // ロール昇格条件（balance_tuning.md 6.4）
  ROLES: [
    { id: 'tester', name: 'テスター', minLevel: 1, score: 30 },
    {
      id: 'test_leader',
      name: 'テストリーダー',
      minLevel: 5,
      cond: (s) => s.tech >= 50 || s.analysis >= 50,
      score: 55,
    },
    {
      id: 'test_manager',
      name: 'テストマネージャー',
      minLevel: 9,
      cond: (s) => s.mgmt >= 55 || (s.tech >= 65 && s.comm >= 50),
      score: 70,
    },
    {
      id: 'consultant',
      name: 'コンサルタント',
      minLevel: 12,
      cond: (s) => s.tech >= 65 && s.comm >= 55,
      score: 80,
    },
    {
      id: 'director',
      name: '部長',
      minLevel: 14,
      cond: (s) => s.mgmt >= 70,
      score: 90,
    },
    {
      id: 'ceo',
      name: '社長',
      minLevel: 18,
      cond: (s) => Object.values(s).every((v) => v >= 65),
      score: 100,
    },
  ] as RoleDefinition[],

  // 最終スコアの重み（balance_tuning.md 6.5）
  SCORE_WEIGHTS: { jstqb: 0.25, bug: 0.30, choice: 0.25, role: 0.20 },

  // ランク境界（balance_tuning.md 6.6）
  RANK_THRESHOLDS: { S: 90, A: 80, B: 70, C: 58 },
} as const;

export const STAT_LABELS: Record<keyof Stats, string> = {
  tech: '技術力',
  comm: 'コミュニケーション',
  analysis: '分析力',
  mgmt: 'マネジメント',
  ai: 'AI 活用',
};

export const STAT_COLORS: Record<keyof Stats, string> = {
  tech: 'var(--st-tech)',
  comm: 'var(--st-comm)',
  analysis: 'var(--st-anal)',
  mgmt: 'var(--st-mgmt)',
  ai: 'var(--st-ai)',
};

export function requiredExp(level: number): number {
  return Math.floor(100 * Math.pow(level, BALANCE.EXP_CURVE_EXPONENT));
}

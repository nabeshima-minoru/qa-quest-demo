// QA Quest — Success Mode バランス定数

import type { Stats, StatKey, RoleId, WeaponCategory, WeaponRarity } from '@/types';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  /** 到達に必要なステータス合計 */
  minStatSum: number;
  /** 追加条件（任意） */
  cond?: (stats: Stats) => boolean;
  /** スコア寄与 */
  score: number;
}

export const BALANCE = {
  /** 総週数（3章 × 12週） */
  MAX_WEEKS: 36,
  /** 1章あたりの週数 */
  CHAPTER_WEEKS: 12,
  /** ボス出現週 */
  BOSS_WEEKS: [12, 24, 36] as const,

  STAT_CAP: 100,
  INITIAL_STATS: { tech: 25, comm: 25, analysis: 25, mgmt: 15, ai: 15 } as Stats,

  // 体力（スタミナ）
  MAX_STAMINA: 100,
  INITIAL_STAMINA: 100,
  /** これを下回ると不調（gain 半減＋追加体力減） */
  LOW_STAMINA: 30,

  // 週イベント発生率
  WEEK_EVENT_CHANCE: 0.45,

  // 訓練のばらつき
  GAIN_VARIANCE: 0.25, // ±25%
  SLUMP_GAIN_FACTOR: 0.5,

  // 武器
  WEAPON_MAX_LEVEL: 5,
  /** 武器レベルごとの威力倍率（power × (1 + (lv-1)*PER_LEVEL)） */
  WEAPON_POWER_PER_LEVEL: 0.22,
  /** 所持中パッシブのレベル倍率 */
  WEAPON_PASSIVE_PER_LEVEL: 0.5,

  // バトル
  PLAYER_MAX_MENTAL: 100,
  /** ダメージ = power + scaleStat × SCALE */
  BATTLE_STAT_SCALE: 0.55,
  /** 相性一致時のダメージ倍率 */
  AFFINITY_BONUS: 1.7,
  /** 相性一致時に軽減される被ダメ割合（0.25 = 25%だけ受ける） */
  MATCH_MENTAL_FACTOR: 0.25,
  /** 不一致時の被ダメ割合 */
  MISS_MENTAL_FACTOR: 1.0,

  // ロール（アバター見た目・スコア用）— ステータス合計で判定
  ROLES: [
    { id: 'tester', name: 'テスター', minStatSum: 0, score: 30 },
    { id: 'test_leader', name: 'テストリーダー', minStatSum: 165, score: 50 },
    { id: 'test_manager', name: 'テストマネージャー', minStatSum: 235, score: 65 },
    {
      id: 'consultant',
      name: 'コンサルタント',
      minStatSum: 295,
      cond: (s) => s.tech >= 60 && s.comm >= 50,
      score: 78,
    },
    {
      id: 'director',
      name: '部長',
      minStatSum: 350,
      cond: (s) => s.mgmt >= 60,
      score: 88,
    },
    {
      id: 'ceo',
      name: '社長',
      minStatSum: 410,
      cond: (s) => Object.values(s).every((v) => v >= 60),
      score: 100,
    },
  ] as RoleDefinition[],

  // 最終スコアの重み
  SCORE_WEIGHTS: { growth: 0.35, battle: 0.35, collection: 0.15, role: 0.15 },

  // ランク境界
  RANK_THRESHOLDS: { S: 88, A: 76, B: 64, C: 50 },
} as const;

export const STAT_LABELS: Record<StatKey, string> = {
  tech: '技術力',
  comm: 'コミュニケーション',
  analysis: '分析力',
  mgmt: 'マネジメント',
  ai: 'AI 活用',
};

export const STAT_COLORS: Record<StatKey, string> = {
  tech: 'var(--st-tech)',
  comm: 'var(--st-comm)',
  analysis: 'var(--st-anal)',
  mgmt: 'var(--st-mgmt)',
  ai: 'var(--st-ai)',
};

/*──────────────────────────────────────
  武器カテゴリの表示メタ
──────────────────────────────────────*/
export const WEAPON_CATEGORY_META: Record<
  WeaponCategory,
  { label: string; short: string; color: string }
> = {
  knowledge: { label: '知識', short: 'KNW', color: 'var(--st-anal)' },
  tech: { label: '技術', short: 'TEC', color: 'var(--st-tech)' },
  connection: { label: '人脈', short: 'CNN', color: 'var(--st-comm)' },
};

export const RARITY_META: Record<
  WeaponRarity,
  { label: string; color: string; rank: number }
> = {
  N: { label: 'N', color: 'var(--text-3)', rank: 1 },
  R: { label: 'R', color: 'var(--st-tech)', rank: 2 },
  SR: { label: 'SR', color: 'var(--brass)', rank: 3 },
};

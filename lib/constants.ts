// QA Quest — デバッグ・ローグライク バランス定数

import type { CardRarity } from '@/types';

export const BALANCE = {
  /*──────── プレイヤー ────────*/
  PLAYER_MAX_HP: 70,
  ENERGY_PER_TURN: 3,
  HAND_SIZE: 5,

  /*──────── ステータス係数 ────────*/
  VULNERABLE_FACTOR: 1.5, // 特定：受けるダメージ+50%
  WEAK_FACTOR: 0.75, // 萎縮：与ダメージ-25%

  /*──────── マップ ────────*/
  TOTAL_ACTS: 3,
  /** 各幕のボス前の行数（+ボス行） */
  ACT_ROWS: [6, 6, 5] as const,

  /*──────── 回復 ────────*/
  REST_HEAL: 24,
  ACT_CLEAR_HEAL: 15,

  /*──────── 報酬 ────────*/
  REWARD_CHOICES: 3,
  RARITY_WEIGHTS: { N: 60, R: 32, SR: 8 } as Record<CardRarity, number>,
  /** エリート・ボス報酬はレア以上 */
  ELITE_RARITY_WEIGHTS: { N: 0, R: 75, SR: 25 } as Record<CardRarity, number>,

  /*──────── スコア ────────*/
  RANK_THRESHOLDS: { S: 90, A: 75, B: 60, C: 45 },
  SCORE_WEIGHTS: {
    progress: 0.4, // 到達フロア
    hp: 0.2, // 生還時の残メンタル
    hunt: 0.25, // 退治したバグ数
    deck: 0.15, // デッキの充実度
  },
} as const;

/** カードタイプの表示メタ */
export const CARD_TYPE_META: Record<
  'attack' | 'skill' | 'power',
  { label: string; color: string }
> = {
  attack: { label: '攻勢', color: 'var(--accent)' },
  skill: { label: '技巧', color: 'var(--info)' },
  power: { label: '体制', color: 'var(--brass)' },
};

export const RARITY_META: Record<CardRarity, { label: string; color: string }> = {
  N: { label: 'N', color: 'var(--text-3)' },
  R: { label: 'R', color: 'var(--info)' },
  SR: { label: 'SR', color: 'var(--brass)' },
};

/** ノード種別の表示メタ */
export const NODE_META = {
  battle: { glyph: '虫', label: 'バグ退治', color: 'var(--st-tech)' },
  elite: { glyph: '鬼', label: '強敵', color: 'var(--danger)' },
  event: { glyph: '談', label: 'できごと', color: 'var(--st-ai)' },
  study: { glyph: '学', label: '勉強会', color: 'var(--st-anal)' },
  rest: { glyph: '休', label: '休憩', color: 'var(--success)' },
  boss: { glyph: '主', label: '大障害', color: 'var(--accent)' },
} as const;

/** 幕のテーマ */
export const ACT_META = [
  {
    act: 1,
    name: '第一幕',
    title: '開発初期',
    subtitle: '小さなバグが芽吹く頃',
    color: 'var(--st-tech)',
  },
  {
    act: 2,
    name: '第二幕',
    title: 'テストフェーズ',
    subtitle: '仕様の穴が牙を剥く',
    color: 'var(--st-anal)',
  },
  {
    act: 3,
    name: '第三幕',
    title: 'リリース前夜',
    subtitle: '最後の大障害が待つ',
    color: 'var(--accent)',
  },
] as const;

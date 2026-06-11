// 訓練コマンド — 毎週1つ選ぶ。体力を消費してステータス成長＋武器ドロップ。

import type { TrainingCommand } from '@/types';

export const trainings: TrainingCommand[] = [
  {
    id: 'TR-TECH',
    name: '技術練習',
    theme: 'tech',
    description: '自動化やツールに手を動かす。技術力とAI活用が伸びる。',
    staminaCost: 22,
    gains: { tech: 6, ai: 2 },
    weaponCategories: ['tech'],
    dropChance: 0.5,
    glyph: '技',
    accent: 'var(--st-tech)',
  },
  {
    id: 'TR-DESIGN',
    name: '設計演習',
    theme: 'analysis',
    description: 'テスト技法とリスク分析を鍛える。分析力が大きく伸びる。',
    staminaCost: 20,
    gains: { analysis: 6, tech: 1 },
    weaponCategories: ['knowledge'],
    dropChance: 0.48,
    glyph: '析',
    accent: 'var(--st-anal)',
  },
  {
    id: 'TR-STUDY',
    name: '勉強会参加',
    theme: 'study',
    description: '社内外の勉強会で学ぶ。知識武器を得やすく、AI活用も伸びる。',
    staminaCost: 16,
    gains: { analysis: 3, ai: 4 },
    weaponCategories: ['knowledge', 'tech'],
    dropChance: 0.6,
    glyph: '学',
    accent: 'var(--st-ai)',
  },
  {
    id: 'TR-SOCIAL',
    name: 'チーム交流',
    theme: 'social',
    description: '開発者や他職種と関わる。コミュ力が伸び、人脈武器を得やすい。',
    staminaCost: 14,
    gains: { comm: 6 },
    weaponCategories: ['connection'],
    dropChance: 0.52,
    glyph: '縁',
    accent: 'var(--st-comm)',
  },
  {
    id: 'TR-MGMT',
    name: 'マネジメント研修',
    theme: 'mgmt',
    description: '計画・調整・交渉を学ぶ。マネジメントとコミュ力が伸びる。',
    staminaCost: 24,
    gains: { mgmt: 6, comm: 2 },
    weaponCategories: ['connection'],
    dropChance: 0.42,
    glyph: '管',
    accent: 'var(--st-mgmt)',
  },
  {
    id: 'TR-REST',
    name: '休養',
    theme: 'rest',
    description: '体力を大きく回復する。成長は無いが、不調を立て直すのに重要。',
    staminaCost: -50,
    gains: {},
    dropChance: 0,
    glyph: '休',
    accent: 'var(--text-3)',
  },
];

export function findTraining(id: string): TrainingCommand | undefined {
  return trainings.find((t) => t.id === id);
}

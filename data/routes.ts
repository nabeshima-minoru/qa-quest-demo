import type { Route } from '@/types';

export const routes: Route[] = [
  {
    id: 'orthodox',
    name: '王道ルート',
    description: '初期ボーナス無し。バランスよく成長を目指す標準コース。',
    initialBonus: {},
  },
  {
    id: 'eng_auto',
    name: 'エンジニア系・自動化',
    description: '自動テスト構築でチームの生産性を底上げするテックリード志向。',
    initialBonus: { tech: 7, analysis: 5, ai: 3 },
  },
  {
    id: 'eng_ai',
    name: 'エンジニア系・AI 活用',
    description: '生成 AI と機械学習をテスト工程に組み込み、新時代の QA を切り拓く。',
    initialBonus: { tech: 5, ai: 9 },
  },
  {
    id: 'eng_pro',
    name: 'エンジニア系・テストアナリスト',
    description:
      'リスク分析と要件読解の深さで、テスト設計の質を一段引き上げる分析職人型。',
    initialBonus: { tech: 5, analysis: 8 },
  },
  {
    id: 'manager',
    name: 'マネージャー系',
    description:
      '人と組織に寄り添いつつ、技術と経営の両輪を回す統括役。チーム品質の最終責任を担う。',
    initialBonus: { comm: 5, mgmt: 8, tech: 2 },
  },
];

export function findRoute(routeId: string): Route | undefined {
  return routes.find((r) => r.id === routeId);
}

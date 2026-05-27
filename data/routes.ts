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
    name: 'エンジニア系・プロフェッショナル',
    description: '深い技術知見と緻密な分析で、難案件を着実に解いていく職人型。',
    initialBonus: { tech: 7, analysis: 6 },
  },
  {
    id: 'mgr_omoto',
    name: 'マネージャー系・大本モデル',
    description: '人と組織に寄り添い、チームの信頼を核にプロジェクトを束ねる人情派。',
    initialBonus: { comm: 7, mgmt: 7 },
  },
  {
    id: 'mgr_ishida',
    name: 'マネージャー系・石田モデル',
    description: '経営視点・改革志向で、技術とマネジメントを両輪に変革を推進する戦略家。',
    initialBonus: { tech: 3, mgmt: 6, comm: 3, ai: 3 },
  },
];

export function findRoute(routeId: string): Route | undefined {
  return routes.find((r) => r.id === routeId);
}

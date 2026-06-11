// QA Quest — 昇進パーク（幕クリアで 3 択から 1 つ）

import type { PerkDef } from '@/types';

export const perks: PerkDef[] = [
  {
    id: 'P-LEADER',
    name: '昇進：テストリーダー',
    role: 'Test Leader',
    glyph: '昇',
    text: '最大メンタル +12、さらに 12 回復',
    effect: { maxHp: 12, heal: 12 },
  },
  {
    id: 'P-AUTOBASE',
    name: '自動化基盤の整備',
    role: 'Automation',
    glyph: '基',
    text: '戦闘開始時、5 ブロックを得る',
    effect: { battleStartBlock: 5 },
  },
  {
    id: 'P-MENTOR',
    name: '後輩の指導役',
    role: 'Mentor',
    glyph: '導',
    text: '戦闘開始時、集中 4（次の攻撃+4）',
    effect: { battleStartFocus: 4 },
  },
  {
    id: 'P-CERT',
    name: '上位資格の取得',
    role: 'Certified',
    glyph: '資',
    text: 'カード報酬に SR が 2 倍出やすくなる',
    effect: { srLuck: true },
  },
  {
    id: 'P-VACATION',
    name: '有給フルリフレッシュ',
    role: 'Refresh',
    glyph: '泉',
    text: 'メンタルを全回復する',
    effect: { healToFull: true },
  },
  {
    id: 'P-TOOLS',
    name: '最新ツールの導入',
    role: 'Tooling',
    glyph: '具',
    text: '毎ターンの手札が 1 枚増える',
    effect: { extraDraw: 1 },
  },
];

export function findPerk(id: string): PerkDef | undefined {
  return perks.find((p) => p.id === id);
}

/*──────────── アーキタイプ（開始デッキ） ────────────*/

import type { ArchetypeDef } from '@/types';

export const archetypes: ArchetypeDef[] = [
  {
    id: 'AR-MANUAL',
    name: '手動テスターの直感',
    description: '軽快な手数で戦うバランス型。スモークテストで素早く回す。',
    glyph: '直',
    color: 'var(--st-comm)',
    deck: [
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REVIEW', false],
      ['ST-REVIEW', false],
      ['ST-REVIEW', false],
      ['ST-REPRO', false],
      ['ST-EXPLORE', false],
      ['N-SMOKE', false],
    ],
  },
  {
    id: 'AR-AUTO',
    name: '自動化エンジニアの仕込み',
    description: '自動化スイートを早期に立ち上げ、毎ターン削り続ける成長型。',
    glyph: '自',
    color: 'var(--st-tech)',
    deck: [
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REVIEW', false],
      ['ST-REVIEW', false],
      ['ST-REVIEW', false],
      ['ST-REPRO', false],
      ['ST-EXPLORE', false],
      ['R-AUTOSUITE', false],
      ['N-PLAN', false],
    ],
  },
  {
    id: 'AR-ANALYST',
    name: '分析官の精密',
    description: '強化済みの境界値分析で急所を撃つ一点突破型。',
    glyph: '析',
    color: 'var(--st-anal)',
    deck: [
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REPORT', false],
      ['ST-REVIEW', false],
      ['ST-REVIEW', false],
      ['ST-REVIEW', false],
      ['ST-REPRO', true],
      ['ST-EXPLORE', false],
      ['N-BOUNDARY', true],
      ['N-LOG', false],
    ],
  },
];

export function findArchetype(id: string): ArchetypeDef | undefined {
  return archetypes.find((a) => a.id === id);
}

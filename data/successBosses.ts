// 章末ボス（武器コマンドバトル用）— 週12 / 24 / 36 に登場。
// 各 demand に weakCategory（特効武器カテゴリ）と mentalDamage（対処失敗時の被ダメ）。
// プレイヤーは所持武器を選んで攻撃。カテゴリが一致するとダメージ増＋被ダメ激減。

import type { SuccessBoss } from '@/types';

export const successBosses: SuccessBoss[] = [
  /*──────────────────────────────────────
    第1章ボス：開発リーダー（週12）
    技術自慢・テスト軽視。技術と知識で押し返す。
  ──────────────────────────────────────*/
  {
    id: 'SB-DEV-LEAD',
    archetype: 'dev_lead',
    name: '大木 拓海',
    title: '開発リーダー',
    chapter: 1,
    week: 12,
    maxHp: 300,
    themeColor: '#4F6675',
    intro:
      'お前がうちのテスターか。俺のコードに難癖つけるってんなら、根拠を持ってこい。\n口先だけなら相手にしないぞ。',
    victory:
      'チッ……完敗だ。お前の指摘、次から真面目に聞くことにするよ。',
    defeat:
      'その程度か。武器が足りてないな。鍛え直して出直してこい。',
    demands: [
      {
        text: 'このバグは仕様だ。修正の必要なし。\nそもそもユーザーはこんな使い方しないだろ？',
        weakCategory: 'knowledge',
        mentalDamage: 18,
      },
      {
        text: '俺はユニットテストを書いてる。\n結合段階でわざわざテストする意味あるのか？',
        weakCategory: 'tech',
        mentalDamage: 20,
      },
      {
        text: 'リリース日は動かせない。\nテスト全部終わらせるとか、現実見えてるか？',
        weakCategory: 'connection',
        mentalDamage: 22,
      },
    ],
  },

  /*──────────────────────────────────────
    第2章ボス：プロダクトマネージャー（週24）
    ビジネス価値重視。知識と人脈で語る。
  ──────────────────────────────────────*/
  {
    id: 'SB-PM',
    archetype: 'product_mgr',
    name: '林 美咲',
    title: 'プロダクトマネージャー',
    chapter: 2,
    week: 24,
    maxHp: 480,
    themeColor: '#76496A',
    intro:
      'テスト工数をそんなに取って、ビジネス価値はどう説明するの？\n感覚じゃなくて、私が納得できる材料で来てね。',
    victory:
      '……正直、説得力ある。あなたのチームに投資する価値がありそうね。',
    defeat:
      'うーん、まだ経営層に持ち上げられる材料には足りないわ。出直して。',
    demands: [
      {
        text: 'テスト工数の ROI を説明して。\n投資対効果が見えないと予算は通せない。',
        weakCategory: 'knowledge',
        mentalDamage: 22,
      },
      {
        text: 'バグレポートが専門用語だらけ。\n経営層に説明できる形にしてくれない？',
        weakCategory: 'connection',
        mentalDamage: 24,
      },
      {
        text: 'テスト自動化の予算、何ヶ月で元が取れるの？\n数字で語ってもらえると助かる。',
        weakCategory: 'tech',
        mentalDamage: 26,
      },
    ],
  },

  /*──────────────────────────────────────
    第3章ボス：CTO（週36）— ラスボス
    戦略・組織論で詰めてくる。全方位の武器が要る。
  ──────────────────────────────────────*/
  {
    id: 'SB-CTO',
    archetype: 'cto',
    name: '神崎 大輔',
    title: '最高技術責任者',
    chapter: 3,
    week: 36,
    maxHp: 680,
    themeColor: '#9C4040',
    intro:
      '来期、QA 組織を任せられる人材か見極めさせてもらう。\n君の積み上げてきたものを、すべて見せてみろ。',
    victory:
      'よろしい。新生 QA 部、君に任せる。期待しているぞ。',
    defeat:
      '……惜しいな。あと一段、視座を上げて出直してこい。',
    demands: [
      {
        text: '生成 AI でテストの大半は自動化できる。\nもう人間のテスターは不要だと思うが、君の見解は？',
        weakCategory: 'tech',
        mentalDamage: 26,
      },
      {
        text: 'QA 部門の人員を半減させる案が出ている。\n君が私を説得する立場ならどうする？',
        weakCategory: 'knowledge',
        mentalDamage: 28,
      },
      {
        text: '最後の問いだ。\n君が QA 組織を率いるとして、5 年後どんな組織にしたい？',
        weakCategory: 'connection',
        mentalDamage: 30,
      },
    ],
  },
];

export function findBossByWeek(week: number): SuccessBoss | null {
  return successBosses.find((b) => b.week === week) ?? null;
}

export function findBossByChapter(chapter: number): SuccessBoss | null {
  return successBosses.find((b) => b.chapter === chapter) ?? null;
}

export function findBossById(id: string): SuccessBoss | null {
  return successBosses.find((b) => b.id === id) ?? null;
}

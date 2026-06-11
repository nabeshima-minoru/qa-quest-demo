// 週イベント — 訓練の合間にランダム発生。能力が上がる/下がる、運、2択。
// パワプロの「ランダムイベント」枠。緩急とサプライズを担当。

import type { WeekEvent } from '@/types';

export const weekEvents: WeekEvent[] = [
  /*──────────── good（能力UP） ────────────*/
  {
    id: 'WE-GOOD-AWARD',
    tone: 'good',
    title: 'バグ報告が表彰された',
    description: '提出した不具合レポートが「今月のファインプレー」に選ばれた。',
    outcome: { message: '自信がついた。分析力とコミュ力が上がった。', stats: { analysis: 3, comm: 2 } },
    weight: 10,
  },
  {
    id: 'WE-GOOD-BOOK',
    tone: 'good',
    title: '刺さった技術書',
    description: '週末に読んだ一冊が、テストの見方を変えてくれた。',
    outcome: { message: '視野が広がった。技術力とAI活用が伸びた。', stats: { tech: 3, ai: 2 } },
    weight: 10,
  },
  {
    id: 'WE-GOOD-MENTOR',
    tone: 'good',
    title: 'メンターからの助言',
    description: '行き詰まっていた観点出しに、先輩がヒントをくれた。',
    outcome: { message: '霧が晴れた。分析力が大きく伸びた。', stats: { analysis: 4 } },
    weight: 9,
  },
  {
    id: 'WE-GOOD-OSS',
    tone: 'good',
    title: 'OSS にコントリビュート',
    description: 'テストツールの不具合を見つけ、修正PRが取り込まれた。',
    outcome: { message: '世界に通用した実感。技術力が伸びた。', stats: { tech: 4 } },
    weight: 7,
  },
  {
    id: 'WE-GOOD-REVIEW',
    tone: 'good',
    title: '丁寧なコードレビュー',
    description: '先輩が君のテストコードを一行ずつ見てくれた。',
    outcome: { message: '基礎が固まった。技術力と分析力が伸びた。', stats: { tech: 2, analysis: 2 } },
    weight: 9,
  },
  {
    id: 'WE-GOOD-TECHNIQUE',
    tone: 'good',
    title: '同値分割を再発見',
    description: '勉強会で基礎技法の奥深さに気づき、手札に加わった。',
    outcome: {
      message: '「テスト技法の基礎」を習得した！',
      stats: { analysis: 1 },
      grantWeaponId: 'WPN-K-TECHNIQUE',
    },
    weight: 5,
  },
  {
    id: 'WE-GOOD-GIT',
    tone: 'good',
    title: 'Git の達人に弟子入り',
    description: '隣のチームの達人にブランチ戦略を仕込まれた。',
    outcome: {
      message: '「Git とブランチ戦略」を習得した！',
      stats: { tech: 1 },
      grantWeaponId: 'WPN-T-GIT',
    },
    weight: 5,
  },

  /*──────────── bad（能力DOWN・体力減） ────────────*/
  {
    id: 'WE-BAD-FIRE',
    tone: 'bad',
    title: '炎上案件に巻き込まれた',
    description: '隣のプロジェクトの火消しに駆り出された。',
    outcome: { message: '消耗した。体力を大きく失った。', stamina: -25 },
    weight: 9,
  },
  {
    id: 'WE-BAD-ALLNIGHT',
    tone: 'bad',
    title: '徹夜デバッグ',
    description: '再現しないバグを追って、気づけば朝だった。',
    outcome: { message: '体調を崩した。体力を失った。', stamina: -30 },
    weight: 8,
  },
  {
    id: 'WE-BAD-SPECCHANGE',
    tone: 'bad',
    title: '仕様変更の波',
    description: '作りかけのテスト設計が、仕様変更で振り出しに。',
    outcome: { message: 'やる気が削がれた。分析力が少し下がり、体力も減った。', stats: { analysis: -2 }, stamina: -10 },
    weight: 8,
  },
  {
    id: 'WE-BAD-RELEASE',
    tone: 'bad',
    title: 'リリース直前トラブル',
    description: '深夜の緊急対応。強いプレッシャーの中で神経をすり減らした。',
    outcome: { message: '疲弊した。マネジメント感覚が鈍り、体力も減った。', stats: { mgmt: -1 }, stamina: -20 },
    weight: 7,
  },
  {
    id: 'WE-BAD-SLUMP',
    tone: 'bad',
    title: 'スランプ',
    description: '何をやってもうまくいかない、そんな一週間。',
    outcome: { message: '調子が出ない。技術力と分析力が少し下がった。', stats: { tech: -2, analysis: -1 } },
    weight: 6,
  },
  {
    id: 'WE-BAD-MEETINGS',
    tone: 'bad',
    title: '会議だらけの一週間',
    description: '気づけば一日中ミーティング。手が動かせなかった。',
    outcome: { message: '時間を奪われた。体力を失った。', stamina: -15 },
    weight: 8,
  },

  /*──────────── fortune（運） ────────────*/
  {
    id: 'WE-FORTUNE-TAILWIND',
    tone: 'fortune',
    title: '思わぬ追い風',
    description: 'チームの雰囲気が良く、何もかもが噛み合う一週間だった。',
    outcome: { message: '気力が満ちた。体力が回復し、コミュ力も上がった。', stamina: 20, stats: { comm: 2 } },
    weight: 6,
  },
  {
    id: 'WE-FORTUNE-INSIGHT',
    tone: 'fortune',
    title: '週末のひらめき',
    description: 'シャワー中に、ずっと悩んでいた問題の答えが降ってきた。',
    outcome: { message: 'ひらめきが宿った。技術力と分析力が伸びた。', stats: { tech: 2, analysis: 2 } },
    weight: 6,
  },

  /*──────────── choice（2択） ────────────*/
  {
    id: 'WE-CHOICE-SIDEJOB',
    tone: 'choice',
    title: '副業の誘い',
    description: '知人から、テスト自動化の副業を持ちかけられた。',
    choices: [
      {
        key: 'A',
        label: '引き受けて技術を磨く',
        outcome: { message: '実戦で鍛えられた。技術力が伸びたが、体力を消費した。', stats: { tech: 4 }, stamina: -20 },
      },
      {
        key: 'B',
        label: '断って本業に集中する',
        outcome: { message: '腰を据えて取り組んだ。分析力が少し伸びた。', stats: { analysis: 2 } },
      },
    ],
    weight: 6,
  },
  {
    id: 'WE-CHOICE-HELP',
    tone: 'choice',
    title: 'ヘルプ要請',
    description: '困っている他チームから、応援に来てほしいと頼まれた。',
    choices: [
      {
        key: 'A',
        label: '手を挙げて助けに行く',
        outcome: { message: '感謝された。コミュ力とマネジメントが伸びたが疲れた。', stats: { comm: 4, mgmt: 2 }, stamina: -25 },
      },
      {
        key: 'B',
        label: '自分の担当に集中する',
        outcome: { message: '担当領域を深掘りできた。分析力が伸びた。', stats: { analysis: 3 } },
      },
    ],
    weight: 6,
  },
  {
    id: 'WE-CHOICE-CERT',
    tone: 'choice',
    title: '資格試験のお誘い',
    description: 'JSTQB Advanced Level の受験仲間を募集している。',
    choices: [
      {
        key: 'A',
        label: '挑戦する',
        outcome: { message: '猛勉強した。分析力が大きく伸びたが体力を使った。', stats: { analysis: 5 }, stamina: -15 },
      },
      {
        key: 'B',
        label: '今回は見送る',
        outcome: { message: '休息に充てた。体力が回復した。', stamina: 10 },
      },
    ],
    weight: 6,
  },
  {
    id: 'WE-CHOICE-LT',
    tone: 'choice',
    title: 'LT 登壇のチャンス',
    description: '社内勉強会で5分の発表枠が空いている。',
    choices: [
      {
        key: 'A',
        label: '登壇する',
        outcome: { message: '人前で話し切った。コミュ力が大きく伸びた。', stats: { comm: 5 }, stamina: -12 },
      },
      {
        key: 'B',
        label: '聴衆として学ぶ',
        outcome: { message: '他者の発表から学んだ。AI活用とコミュ力が少し伸びた。', stats: { ai: 2, comm: 1 } },
      },
    ],
    weight: 6,
  },
];

export function findWeekEvent(id: string): WeekEvent | undefined {
  return weekEvents.find((e) => e.id === id);
}

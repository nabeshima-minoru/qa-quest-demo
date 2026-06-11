// QA Quest — マップイベント（談）定義

import type { RunEventDef } from '@/types';

export const runEvents: RunEventDef[] = [
  {
    id: 'EV-SENPAI',
    name: '先輩の差し入れ',
    glyph: '茶',
    text: '残業中、先輩がコーヒーと菓子折りを置いていった。「無理すんなよ。あと、その辺のコード、少し整理しといたから」',
    choices: [
      {
        label: 'ありがたくいただく',
        detail: 'メンタルを 12 回復',
        effect: { heal: 12 },
      },
      {
        label: '整理の続きを引き受ける',
        detail: 'デッキからカードを 1 枚除去',
        effect: { removePick: true },
      },
    ],
  },
  {
    id: 'EV-POSTMORTEM',
    name: '障害振り返り会',
    glyph: '省',
    text: '先月の本番障害のポストモーテムに招かれた。生々しい失敗談は重いが、得られる学びは大きい。',
    choices: [
      {
        label: '最前列で聞き込む',
        detail: 'メンタル -8、SR カードを 1 枚獲得',
        effect: { damage: 8, addCardRarity: 'SR' },
      },
      {
        label: '資料だけもらう',
        detail: 'R カードを 1 枚獲得',
        effect: { addCardRarity: 'R' },
      },
    ],
  },
  {
    id: 'EV-STUDY',
    name: '社外勉強会',
    glyph: '灯',
    text: '金曜夜の社外勉強会。登壇者は意外にも他部署のあの人だった。「明日から使えるテスト設計」、悪くないテーマだ。',
    choices: [
      {
        label: '懇親会まで参加する',
        detail: 'カードを 1 枚選んで強化',
        effect: { upgradePick: true },
      },
      {
        label: '早めに帰って休む',
        detail: '最大メンタル +6',
        effect: { maxHp: 6 },
      },
    ],
  },
  {
    id: 'EV-SPECCHANGE',
    name: '急な仕様変更',
    glyph: '変',
    text: '「すみません、ここの仕様変わります」。リリースを目前に、PM が静かに頭を下げた。テスト観点の組み直しが必要だ。',
    choices: [
      {
        label: '観点を組み直す',
        detail: 'ランダムなカード 1 枚が別のカードに変化',
        effect: { transformRandom: true },
      },
      {
        label: '影響範囲に絞って凌ぐ',
        detail: 'メンタル -5',
        effect: { damage: 5 },
      },
    ],
  },
  {
    id: 'EV-OVERTIME',
    name: '残業要請',
    glyph: '宵',
    text: '「今日中にもう一周、回せないかな」。窓の外はもう暗い。だが、ここで回した一周が明日の品質を作るのも事実だ。',
    choices: [
      {
        label: '引き受ける',
        detail: 'メンタル -10、カード報酬（3 択）',
        effect: { damage: 10, rewardCards: true },
      },
      {
        label: '明日の朝イチで回す',
        detail: 'メンタルを 6 回復',
        effect: { heal: 6 },
      },
    ],
  },
  {
    id: 'EV-QUIET',
    name: '静かな水曜日',
    glyph: '凪',
    text: '障害ゼロ、割り込みゼロ。お茶がいつもより美味い。こんな日もあるのだ。',
    choices: [
      {
        label: 'しっかり休む',
        detail: 'メンタルを 10 回復',
        effect: { heal: 10 },
      },
      {
        label: '積読の技術書を開く',
        detail: 'N カードを 1 枚獲得',
        effect: { addCardRarity: 'N' },
      },
    ],
  },
];

export function findEvent(id: string): RunEventDef | undefined {
  return runEvents.find((e) => e.id === id);
}

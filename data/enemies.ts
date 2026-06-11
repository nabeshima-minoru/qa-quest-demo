// QA Quest — 敵（バグ）定義と幕ごとのエンカウント

import type { EncounterDef, EnemyDef } from '@/types';

export const enemies: EnemyDef[] = [
  /*──────────── 第一幕：開発初期 ────────────*/
  {
    id: 'E-NULLPO',
    name: 'ヌルポ',
    hpRange: [14, 16],
    sprite: 'blob',
    color: '#4F6675',
    moves: [
      { key: 'poke', label: '不意の例外', kind: 'attack', damage: 5 },
      { key: 'crash', label: 'クラッシュ', kind: 'attack', damage: 7 },
    ],
    flavor: 'null チェックの隙間から生まれる、最も古典的な妖怪。',
  },
  {
    id: 'E-TYPO',
    name: 'タイポ',
    hpRange: [6, 7],
    sprite: 'mite',
    color: '#A57728',
    scale: 0.65,
    moves: [
      { key: 'nibble', label: 'かじる', kind: 'attack', damage: 3 },
      { key: 'nibble2', label: 'かじる', kind: 'attack', damage: 4 },
    ],
    flavor: '一文字の間違い。群れると侮れない。',
  },
  {
    id: 'E-LAYOUT',
    name: '表示崩れ',
    hpRange: [12, 14],
    sprite: 'glitch',
    color: '#76496A',
    moves: [
      { key: 'shift', label: 'レイアウト侵食', kind: 'attack', damage: 4 },
      { key: 'hide', label: 'z-index の壁', kind: 'block', block: 5 },
    ],
    flavor: '特定の画面幅でだけ現れる、ズレの妖怪。',
  },
  {
    id: 'E-OFFBY',
    name: 'オフバイワン',
    hpRange: [18, 20],
    sprite: 'crab',
    color: '#8E5638',
    moves: [
      { key: 'pinch', label: '±1 の鋏', kind: 'attack', damage: 6 },
      { key: 'pinch2', label: '±1 の鋏', kind: 'attack', damage: 6 },
      { key: 'guard', label: '境界に籠る', kind: 'block', block: 8 },
    ],
    flavor: '「以上」と「より大きい」を永遠に間違え続けるカニ。',
  },
  {
    id: 'E-MEMLEAK',
    name: 'メモリリーク',
    title: '強敵',
    hpRange: [30, 34],
    sprite: 'slime',
    color: '#5E7A4A',
    scale: 1.25,
    moves: [
      { key: 'drip', label: 'にじみ出る', kind: 'attack', damage: 5 },
      { key: 'grow', label: '肥大化', kind: 'buff', strength: 3 },
    ],
    flavor: '放置すればするほど膨らみ、ある日すべてを飲み込む。',
  },
  {
    id: 'B-PAYBUG',
    name: '二重決済',
    title: '本番障害',
    hpRange: [60, 60],
    sprite: 'oni',
    color: '#B85C5C',
    scale: 1.6,
    moves: [
      { key: 'charge', label: '請求の連打', kind: 'attack', damage: 9 },
      { key: 'panic', label: '問い合わせの嵐', kind: 'debuff', weakPlayer: 2, damage: 5 },
      { key: 'storm', label: '返金地獄', kind: 'big', damage: 14 },
    ],
    flavor: 'ユーザーの怒りを背負って現れる、第一幕の大障害。',
  },

  /*──────────── 第二幕：テストフェーズ ────────────*/
  {
    id: 'E-SPECHOLE',
    name: '仕様の穴',
    hpRange: [16, 18],
    sprite: 'ghost',
    color: '#9C907C',
    moves: [
      { key: 'empower', label: '曖昧さの加護', kind: 'buff', strength: 2, strengthAll: true },
      { key: 'drain', label: '解釈違い', kind: 'attack', damage: 4 },
    ],
    flavor: '「そこは書いてなかったので」。仲間のバグを育てる。',
  },
  {
    id: 'E-MOJIBAKE',
    name: '文字化け',
    hpRange: [20, 22],
    sprite: 'moji',
    color: '#76496A',
    moves: [
      { key: 'garble', label: '???の連射', kind: 'attack', damage: 4, hits: 2 },
      { key: 'encode', label: 'エンコード障壁', kind: 'block', block: 6 },
    ],
    flavor: 'Shift_JIS と UTF-8 の狭間に棲む、読めない怨念。',
  },
  {
    id: 'E-RACE',
    name: '競合状態',
    hpRange: [22, 24],
    sprite: 'glitch',
    color: '#4F6675',
    moves: [
      { key: 'double', label: '同時実行', kind: 'attack', damage: 4, hits: 2 },
      { key: 'burst', label: 'タイミング直撃', kind: 'attack', damage: 9 },
    ],
    flavor: '千回に一度だけ牙を剥く。今日がその一度だ。',
  },
  {
    id: 'E-DEADLOCK',
    name: 'デッドロック',
    hpRange: [26, 28],
    sprite: 'knot',
    color: '#3D5161',
    moves: [
      { key: 'lock', label: '相互ロック', kind: 'block', block: 10 },
      { key: 'squeeze', label: '締め上げ', kind: 'attack', damage: 8 },
    ],
    flavor: 'お互いを待ち続けて、世界ごと止める結び目。',
  },
  {
    id: 'E-HEISEN',
    name: '再現困難バグ',
    title: '強敵',
    hpRange: [44, 48],
    sprite: 'ghost',
    color: '#5A7585',
    scale: 1.3,
    moves: [
      { key: 'fade', label: '観測から逃れる', kind: 'block', block: 12 },
      { key: 'strike', label: '本番でだけ咬む', kind: 'attack', damage: 10 },
      { key: 'flicker', label: '明滅', kind: 'attack', damage: 6, block: 6 },
    ],
    flavor: 'デバッガを繋ぐと消える。ログを仕込むと現れない。',
  },
  {
    id: 'B-DATALOSS',
    name: 'データ消失',
    title: '本番障害',
    hpRange: [90, 90],
    sprite: 'oni',
    color: '#3D5161',
    scale: 1.7,
    moves: [
      { key: 'erase', label: 'レコードの蒸発', kind: 'attack', damage: 10 },
      { key: 'corrupt', label: '整合性の崩壊', kind: 'attack', damage: 6, hits: 2 },
      { key: 'empower', label: '夜間バッチの暴走', kind: 'buff', strength: 3 },
      { key: 'wipe', label: 'テーブル全消去', kind: 'big', damage: 16 },
    ],
    flavor: 'バックアップは、取っていたか。リストアは、試したか。',
  },

  /*──────────── 第三幕：リリース前夜 ────────────*/
  {
    id: 'E-LEGACY',
    name: 'レガシーコード',
    hpRange: [38, 42],
    sprite: 'golem',
    color: '#6A5733',
    scale: 1.2,
    moves: [
      { key: 'slam', label: '技術的負債の重み', kind: 'attack', damage: 12 },
      { key: 'harden', label: '誰も触れない聖域', kind: 'block', block: 8 },
    ],
    flavor: 'コメントには「2009年 田中」とだけ書いてある。',
  },
  {
    id: 'E-CIRC',
    name: '循環参照',
    hpRange: [18, 20],
    sprite: 'knot',
    color: '#8E5638',
    moves: [
      { key: 'spin', label: '相互依存の強化', kind: 'buff', strength: 2, strengthAll: true },
      { key: 'bite', label: '巻き込み', kind: 'attack', damage: 5 },
    ],
    flavor: 'A は B を呼び、B は A を呼ぶ。二体で現れる。',
  },
  {
    id: 'E-INJECT',
    name: 'インジェクション',
    hpRange: [24, 26],
    sprite: 'spider',
    color: '#9C4040',
    moves: [
      { key: 'sting', label: '悪意の注入', kind: 'attack', damage: 7 },
      { key: 'venom', label: '萎縮の毒', kind: 'debuff', weakPlayer: 2, damage: 3 },
    ],
    flavor: "'; DROP TABLE users; -- の囁きが聞こえる。",
  },
  {
    id: 'E-ONCALL',
    name: 'オンコール地獄',
    title: '強敵',
    hpRange: [54, 58],
    sprite: 'oni',
    color: '#944848',
    scale: 1.3,
    moves: [
      { key: 'ring', label: '深夜のアラート', kind: 'attack', damage: 8, hits: 2 },
      { key: 'storm', label: 'エスカレーション', kind: 'attack', damage: 14 },
      { key: 'brace', label: '一時しのぎ', kind: 'block', block: 10 },
    ],
    flavor: '午前3時。電話は鳴り止まない。',
  },
  {
    id: 'B-MIDNIGHT',
    name: '全面障害',
    title: 'リリース前夜',
    hpRange: [130, 130],
    sprite: 'oni',
    color: '#2A2520',
    scale: 1.9,
    moves: [
      { key: 'crush', label: 'サービス停止', kind: 'attack', damage: 12 },
      { key: 'despair', label: '障害報告の重圧', kind: 'debuff', weakPlayer: 2, damage: 6 },
      { key: 'wall', label: '原因不明の沈黙', kind: 'block', block: 15 },
    ],
    enrageMoves: [
      { key: 'rage', label: '連鎖障害', kind: 'attack', damage: 9, hits: 2 },
      { key: 'final', label: '全システム崩壊', kind: 'big', damage: 18 },
      { key: 'despair2', label: '報道対応', kind: 'debuff', weakPlayer: 2, damage: 8 },
    ],
    flavor: 'リリース 6 時間前。すべてのダッシュボードが赤に染まる。',
  },
];

export function findEnemy(id: string): EnemyDef | undefined {
  return enemies.find((e) => e.id === id);
}

/*──────────── 幕ごとのエンカウントテーブル ────────────*/

export interface ActEncounters {
  normal: EncounterDef[];
  elite: EncounterDef[];
  boss: EncounterDef;
}

export const ACT_ENCOUNTERS: ActEncounters[] = [
  {
    normal: [
      { enemies: ['E-NULLPO'] },
      { enemies: ['E-TYPO', 'E-TYPO', 'E-TYPO'] },
      { enemies: ['E-LAYOUT', 'E-NULLPO'] },
      { enemies: ['E-OFFBY'] },
      { enemies: ['E-LAYOUT', 'E-TYPO'] },
    ],
    elite: [{ enemies: ['E-MEMLEAK'] }],
    boss: { enemies: ['B-PAYBUG'] },
  },
  {
    normal: [
      { enemies: ['E-SPECHOLE', 'E-MOJIBAKE'] },
      { enemies: ['E-RACE'] },
      { enemies: ['E-DEADLOCK'] },
      { enemies: ['E-MOJIBAKE', 'E-NULLPO'] },
      { enemies: ['E-RACE', 'E-SPECHOLE'] },
    ],
    elite: [{ enemies: ['E-HEISEN'] }],
    boss: { enemies: ['B-DATALOSS'] },
  },
  {
    normal: [
      { enemies: ['E-LEGACY'] },
      { enemies: ['E-CIRC', 'E-CIRC'] },
      { enemies: ['E-INJECT'] },
      { enemies: ['E-INJECT', 'E-CIRC'] },
    ],
    elite: [{ enemies: ['E-ONCALL'] }],
    boss: { enemies: ['B-MIDNIGHT'] },
  },
];

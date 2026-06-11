// 武器カード — 知識(knowledge) / 技術(tech) / 人脈(connection) × N/R/SR
// 所持中は passive を常時加算、バトルでは power + scaleStat 依存で攻撃。

import type { Weapon, WeaponCategory, WeaponRarity } from '@/types';

export const weapons: Weapon[] = [
  /*──────────── 知識（分析・AIにスケール） ────────────*/
  {
    id: 'WPN-K-JSTQB',
    name: 'JSTQB Foundation',
    category: 'knowledge',
    rarity: 'N',
    flavor: 'テストの基礎用語と7原則。すべての土台になる知識。',
    passive: { analysis: 2 },
    power: 22,
    scaleStat: 'analysis',
    glyph: 'JS',
  },
  {
    id: 'WPN-K-TECHNIQUE',
    name: 'テスト技法の基礎',
    category: 'knowledge',
    rarity: 'N',
    flavor: '同値分割・境界値分析・デシジョンテーブル。設計の引き出し。',
    passive: { analysis: 2 },
    power: 24,
    scaleStat: 'analysis',
    glyph: '技法',
  },
  {
    id: 'WPN-K-ISO25010',
    name: 'ISO/IEC 25010 品質モデル',
    category: 'knowledge',
    rarity: 'R',
    flavor: '機能適合性から保守性まで、品質特性で語る共通言語。',
    passive: { analysis: 3, ai: 1 },
    power: 35,
    scaleStat: 'analysis',
    glyph: 'ISO',
  },
  {
    id: 'WPN-K-RISK',
    name: 'リスクベースドテスト',
    category: 'knowledge',
    rarity: 'R',
    flavor: '限られた工数を、壊れたら痛い所へ。優先度の科学。',
    passive: { analysis: 4 },
    power: 37,
    scaleStat: 'analysis',
    glyph: 'RBT',
  },
  {
    id: 'WPN-K-EXPLORATORY',
    name: '探索的テストの極意',
    category: 'knowledge',
    rarity: 'SR',
    flavor: '仕様の隙間を嗅ぎ分ける、熟練の感性と論理。',
    passive: { analysis: 5, comm: 2 },
    power: 50,
    scaleStat: 'analysis',
    glyph: '探索',
  },
  {
    id: 'WPN-K-FORMAL',
    name: '形式手法とモデル検査',
    category: 'knowledge',
    rarity: 'SR',
    flavor: '状態空間を数学で抑え込む。バグの居場所を理論で塞ぐ。',
    passive: { analysis: 4, tech: 3 },
    power: 52,
    scaleStat: 'analysis',
    glyph: '形式',
  },

  /*──────────── 技術（技術・AIにスケール） ────────────*/
  {
    id: 'WPN-T-SELENIUM',
    name: 'Selenium 自動化',
    category: 'tech',
    rarity: 'N',
    flavor: 'ブラウザ操作を手放しに。回帰テストの相棒。',
    passive: { tech: 2 },
    power: 24,
    scaleStat: 'tech',
    glyph: 'SE',
  },
  {
    id: 'WPN-T-GIT',
    name: 'Git とブランチ戦略',
    category: 'tech',
    rarity: 'N',
    flavor: '変更を追い、衝突を制す。開発と並走するための足腰。',
    passive: { tech: 2 },
    power: 22,
    scaleStat: 'tech',
    glyph: 'Git',
  },
  {
    id: 'WPN-T-CICD',
    name: 'CI/CD パイプライン',
    category: 'tech',
    rarity: 'R',
    flavor: 'テストを自動で回し続ける仕組み。品質を高速道路に乗せる。',
    passive: { tech: 4 },
    power: 36,
    scaleStat: 'tech',
    glyph: 'CI',
  },
  {
    id: 'WPN-T-APITEST',
    name: 'API テスト技術',
    category: 'tech',
    rarity: 'R',
    flavor: '画面の裏側を直接叩く。境界をまたぐ不具合を捕える。',
    passive: { tech: 3, ai: 1 },
    power: 34,
    scaleStat: 'tech',
    glyph: 'API',
  },
  {
    id: 'WPN-T-FRAMEWORK',
    name: '自動化フレームワーク自作',
    category: 'tech',
    rarity: 'SR',
    flavor: 'チームの手足を増やす基盤。書けば書くほど未来が軽くなる。',
    passive: { tech: 5 },
    power: 52,
    scaleStat: 'tech',
    glyph: 'FW',
  },
  {
    id: 'WPN-T-GENAI',
    name: '生成 AI テスト生成',
    category: 'tech',
    rarity: 'SR',
    flavor: 'LLM にテスト観点を量産させ、人は判断に集中する新時代の武器。',
    passive: { ai: 5, tech: 2 },
    power: 50,
    scaleStat: 'ai',
    glyph: 'AI',
  },

  /*──────────── 人脈（コミュ・マネジメントにスケール） ────────────*/
  {
    id: 'WPN-C-TRUST',
    name: '開発者との信頼関係',
    category: 'connection',
    rarity: 'N',
    flavor: '「あなたが言うなら直す」。指摘を通すための土壌。',
    passive: { comm: 2 },
    power: 22,
    scaleStat: 'comm',
    glyph: '信頼',
  },
  {
    id: 'WPN-C-STANDUP',
    name: '朝会での発信力',
    category: 'connection',
    rarity: 'N',
    flavor: '短く、的確に、品質状況を届ける。毎日の小さな影響力。',
    passive: { comm: 2 },
    power: 24,
    scaleStat: 'comm',
    glyph: '発信',
  },
  {
    id: 'WPN-C-COMMUNITY',
    name: 'QA コミュニティの仲間',
    category: 'connection',
    rarity: 'R',
    flavor: '社外に相談できる仲間。詰まったとき道を照らす横のつながり。',
    passive: { comm: 3, mgmt: 1 },
    power: 35,
    scaleStat: 'comm',
    glyph: '仲間',
  },
  {
    id: 'WPN-C-STAKEHOLDER',
    name: 'ステークホルダー調整力',
    category: 'connection',
    rarity: 'R',
    flavor: '利害の違う人々を同じ机に。落とし所を見つける交渉術。',
    passive: { comm: 3, mgmt: 2 },
    power: 37,
    scaleStat: 'comm',
    glyph: '調整',
  },
  {
    id: 'WPN-C-EXEC',
    name: '経営層への提言力',
    category: 'connection',
    rarity: 'SR',
    flavor: '品質を数字と物語で語り、投資判断を動かす説得の力。',
    passive: { mgmt: 5, comm: 2 },
    power: 52,
    scaleStat: 'mgmt',
    glyph: '提言',
  },
  {
    id: 'WPN-C-SPEAKER',
    name: 'カンファレンス登壇の名声',
    category: 'connection',
    rarity: 'SR',
    flavor: '名が知られ、言葉に重みが乗る。業界に響く発信者の証。',
    passive: { comm: 5 },
    power: 50,
    scaleStat: 'comm',
    glyph: '登壇',
  },

  /*──────────── ボス撃破トロフィー（章ごとの戦利品） ────────────*/
  {
    id: 'WPN-TROPHY-CH1',
    name: '現場を制した一手',
    category: 'tech',
    rarity: 'SR',
    flavor: '開発リーダーを再現手順で黙らせた経験。技術で語る自信。',
    passive: { tech: 4, analysis: 2 },
    power: 56,
    scaleStat: 'tech',
    glyph: '一手',
  },
  {
    id: 'WPN-TROPHY-CH2',
    name: 'ROI で語る品質',
    category: 'knowledge',
    rarity: 'SR',
    flavor: 'プロダクトマネージャーを数字で納得させた説得力。',
    passive: { analysis: 4, mgmt: 3 },
    power: 58,
    scaleStat: 'analysis',
    glyph: 'ROI',
  },
  {
    id: 'WPN-TROPHY-CH3',
    name: '品質経営のビジョン',
    category: 'connection',
    rarity: 'SR',
    flavor: 'CTO に組織の未来を語り切った、リーダーとしての視座。',
    passive: { mgmt: 5, comm: 3, analysis: 2 },
    power: 62,
    scaleStat: 'mgmt',
    glyph: '経営',
  },
];

/** ID から武器を取得 */
export function findWeapon(id: string): Weapon | undefined {
  return weapons.find((w) => w.id === id);
}

/** 訓練ドロップ用：トロフィー以外の通常武器プール */
export const normalWeapons = weapons.filter((w) => !w.id.startsWith('WPN-TROPHY'));

/** 章ごとのトロフィー武器 ID */
export const TROPHY_BY_CHAPTER: Record<number, string> = {
  1: 'WPN-TROPHY-CH1',
  2: 'WPN-TROPHY-CH2',
  3: 'WPN-TROPHY-CH3',
};

/** レア度の抽選重み */
export const RARITY_WEIGHTS: Record<WeaponRarity, number> = {
  N: 60,
  R: 32,
  SR: 8,
};

/** カテゴリ・レア度で通常武器を抽選するためのフィルタ */
export function poolByCategory(categories?: WeaponCategory[]): Weapon[] {
  if (!categories || categories.length === 0) return normalWeapons;
  return normalWeapons.filter((w) => categories.includes(w.category));
}

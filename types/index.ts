// QA Quest — Success Mode 共通型定義
// 「パワプロ サクセス」風：週単位の訓練で武器(知識/技術/人脈)を集め、章末ボスと武器コマンドバトル。

/*──────────────────────────────────────
  基本ステータス
──────────────────────────────────────*/
export type StatKey = 'tech' | 'comm' | 'analysis' | 'mgmt' | 'ai';
export type Stats = Record<StatKey, number>;

/** プレイヤーの到達ロール（アバターの見た目に反映） */
export type RoleId =
  | 'tester'
  | 'test_leader'
  | 'test_manager'
  | 'consultant'
  | 'director'
  | 'ceo';

/*──────────────────────────────────────
  キャリアルート（開始時ボーナス）
──────────────────────────────────────*/
export interface Route {
  id: string;
  name: string;
  description?: string;
  initialBonus: Partial<Stats>;
}

/*──────────────────────────────────────
  武器カード（知識・技術・人脈）
──────────────────────────────────────*/
export type WeaponCategory = 'knowledge' | 'tech' | 'connection';
export type WeaponRarity = 'N' | 'R' | 'SR';

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  rarity: WeaponRarity;
  /** フレーバー（QA 的な意味づけ） */
  flavor: string;
  /** 所持中に常時加算されるステータス補正 */
  passive: Partial<Stats>;
  /** バトル時の基礎ダメージ */
  power: number;
  /** ダメージがスケールするステータス */
  scaleStat: StatKey;
  /** カードに表示する短いシンボル（1〜2文字） */
  glyph: string;
}

/** 所持武器（重複取得でレベルが上がり威力UP） */
export interface OwnedWeapon {
  id: string;
  level: number;
}

/*──────────────────────────────────────
  訓練コマンド
──────────────────────────────────────*/
export type TrainingTheme = 'tech' | 'study' | 'analysis' | 'social' | 'mgmt' | 'rest';

export interface TrainingCommand {
  id: string;
  name: string;
  theme: TrainingTheme;
  description: string;
  /** 体力消費（休養はマイナス＝回復） */
  staminaCost: number;
  /** 基礎ステータス上昇（体力・乱数で増減） */
  gains: Partial<Stats>;
  /** 武器ドロップ候補（カテゴリで絞る用途）。空なら全体プールから */
  weaponCategories?: WeaponCategory[];
  /** 武器を獲得する確率 0..1 */
  dropChance: number;
  /** カード表示シンボル */
  glyph: string;
  /** テーマ色（CSS 変数 or hex） */
  accent: string;
}

/*──────────────────────────────────────
  週イベント（ランダム / good・bad）
──────────────────────────────────────*/
export type WeekEventTone = 'good' | 'bad' | 'fortune' | 'choice';

export interface WeekEventOutcome {
  /** 結果メッセージ */
  message: string;
  /** ステータス増減 */
  stats?: Partial<Stats>;
  /** 体力増減 */
  stamina?: number;
  /** 付与する武器 ID（任意） */
  grantWeaponId?: string;
}

export interface WeekEventChoice {
  key: 'A' | 'B';
  label: string;
  outcome: WeekEventOutcome;
}

export interface WeekEvent {
  id: string;
  tone: WeekEventTone;
  title: string;
  description: string;
  /** tone !== 'choice' の場合の即時結果 */
  outcome?: WeekEventOutcome;
  /** tone === 'choice' の場合の選択肢 */
  choices?: WeekEventChoice[];
  /** 出現重み */
  weight: number;
}

/*──────────────────────────────────────
  週リザルト（1週間の解決結果）
──────────────────────────────────────*/
export interface WeekResolution {
  week: number;
  trainingId: string;
  trainingName: string;
  /** 実際に適用されたステータス増減 */
  statDelta: Partial<Stats>;
  staminaDelta: number;
  /** 体力不足などで不調だったか */
  slump: boolean;
  /** 訓練で獲得した武器（あれば） */
  gainedWeaponId: string | null;
  /** 既存武器のレベルアップだったか */
  weaponLevelUp: boolean;
  /** 発生した週イベント（あれば） */
  event: WeekEvent | null;
  /** イベントが選択式で未解決なら true */
  eventPending: boolean;
  /** 解決済みイベントの結果メッセージ */
  eventResult: WeekEventOutcome | null;
}

/*──────────────────────────────────────
  ボス（武器コマンドバトル）
──────────────────────────────────────*/
export type BossArchetype = 'dev_lead' | 'backend_lead' | 'product_mgr' | 'cto';

export interface BossDemand {
  /** 無理難題のセリフ */
  text: string;
  /** 効果的（特効）な武器カテゴリ */
  weakCategory: WeaponCategory;
  /** 対処に失敗したときプレイヤーが受けるメンタルダメージ */
  mentalDamage: number;
}

export interface SuccessBoss {
  id: string;
  archetype: BossArchetype;
  name: string;
  title: string;
  /** 第何章のボスか (1..3) */
  chapter: number;
  /** 登場週 (12/24/36) */
  week: number;
  maxHp: number;
  themeColor: string;
  intro: string;
  victory: string;
  /** プレイヤー敗北（撤退）時 */
  defeat: string;
  /** 難題のループ */
  demands: BossDemand[];
}

/*──────────────────────────────────────
  バトル状態
──────────────────────────────────────*/
export interface BattleLogEntry {
  turn: number;
  weaponId: string;
  weaponName: string;
  matched: boolean;
  damageDealt: number;
  mentalTaken: number;
}

export interface BattlePending {
  weaponId: string;
  weaponName: string;
  matched: boolean;
  damageDealt: number;
  mentalTaken: number;
  reaction: string;
}

export interface BattleState {
  bossId: string;
  chapter: number;
  bossHp: number;
  bossMaxHp: number;
  playerMental: number;
  playerMaxMental: number;
  /** 現在のターン（1-index） */
  turn: number;
  /** 現在提示中の demand index */
  demandIndex: number;
  log: BattleLogEntry[];
  /** 直近アクションの演出待ち（null=入力待ち） */
  pending: BattlePending | null;
  result: 'win' | 'lose' | null;
}

/** 章末総括・最終結果用に保持するバトル結果サマリ */
export interface BattleResult {
  bossId: string;
  chapter: number;
  result: 'win' | 'lose';
  bossMaxHp: number;
  remainingBossHp: number;
  remainingMental: number;
  playerMaxMental: number;
  turnsTaken: number;
}

/*──────────────────────────────────────
  最終スコア
──────────────────────────────────────*/
export interface ScoreResult {
  finalScore: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    /** ステータス成長スコア */
    growthScore: number;
    /** ボス撃破スコア */
    battleScore: number;
    /** 武器コレクションスコア */
    collectionScore: number;
    /** 到達ロールスコア */
    roleScore: number;
  };
}

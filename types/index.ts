/*──────────────────────────────────────
  QA QUEST — デバッグ・ローグライク 型定義
  プレイヤー=QAテスター / 敵=バグ / カード=QA技法
──────────────────────────────────────*/

/*──────────── カード ────────────*/

export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'N' | 'R' | 'SR';
export type CardTarget = 'single' | 'all' | 'random' | 'none';

/** カードの効果パラメータ（エンジンが解釈する） */
export interface CardEffects {
  damage?: number;
  hits?: number;
  target?: CardTarget;
  block?: number;
  draw?: number;
  energyGain?: number;
  heal?: number;
  /** 敵に付与：特定（受けるダメージ+50%）ターン数 */
  vulnerable?: number;
  /** 敵に付与：萎縮（与ダメージ-25%）ターン数 */
  weak?: number;
  /** 自分に付与：集中（次の攻撃+N、使用で消費） */
  focus?: number;
  /** X コスト（残り工数をすべて消費し、damage × X） */
  xCost?: boolean;
  /** 攻撃が敵のブロックを無視する（貫通） */
  ignoreBlock?: boolean;
  /** 使用時に自分のメンタルを削る（自傷コスト。1 未満にはならない） */
  selfDamage?: number;
  /** パワー：ターン開始時の自動効果に加算 */
  autoDamage?: number;
  autoDraw?: number;
  autoBlock?: number;
  autoHeal?: number;
  autoFocus?: number;
  /** 使用後に消滅 */
  exhaust?: boolean;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number; // xCost のときは表示用に -1
  glyph: string; // 1〜2文字の漢字シンボル
  text: string;
  upgradeText: string;
  flavor: string;
  effects: CardEffects;
  /** 強化時に上書きされる効果（コスト変更は upgradeCost） */
  upgraded: Partial<CardEffects>;
  upgradeCost?: number;
}

/** デッキ内のカード実体 */
export interface CardInstance {
  uid: string;
  defId: string;
  upgraded: boolean;
}

/*──────────── 敵（バグ） ────────────*/

export type SpriteKind =
  | 'blob'      // ヌルポ：丸いアメーバ
  | 'mite'      // タイポ：小さなダニ
  | 'glitch'    // 表示崩れ：ズレた四角
  | 'crab'      // オフバイワン：カニ
  | 'slime'     // メモリリーク：膨らむスライム
  | 'ghost'     // 再現困難バグ：半透明の幽霊
  | 'moji'      // 文字化け：崩れた文字塊
  | 'knot'      // デッドロック/循環参照：絡まった結び目
  | 'spider'    // インジェクション：注射針グモ
  | 'golem'     // レガシーコード：石のゴーレム
  | 'oni';      // ボス：鬼面

export type EnemyMoveKind = 'attack' | 'block' | 'buff' | 'debuff' | 'big';

export interface EnemyMove {
  key: string;
  label: string;
  kind: EnemyMoveKind;
  damage?: number;
  hits?: number;
  block?: number;
  /** 自分（または味方全体）に筋力：与ダメ+N 永続 */
  strength?: number;
  strengthAll?: boolean;
  /** プレイヤーに萎縮（与ダメ-25%）を付与するターン数 */
  weakPlayer?: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  title?: string;
  hpRange: [number, number];
  sprite: SpriteKind;
  color: string; // メインカラー（CSS color）
  scale?: number; // 表示倍率（1 = 標準）
  moves: EnemyMove[];
  /** HP半分以下で切り替わる行動パターン（ボス用） */
  enrageMoves?: EnemyMove[];
  flavor: string;
}

export interface EnemyInstance {
  uid: string;
  defId: string;
  hp: number;
  maxHp: number;
  block: number;
  vulnerable: number; // 残ターン
  weak: number; // 残ターン
  strength: number; // 永続加算
  moveIndex: number;
  enraged: boolean;
  /** 次に使う行動（インテント表示用） */
  nextMove: EnemyMove;
  dead: boolean;
}

/*──────────── バトル ────────────*/

export type BattlePhase = 'player' | 'enemy' | 'won' | 'lost';

/** 演出イベント：UI が浮遊ダメージ等を描画するために消費 */
export interface FxEvent {
  id: number;
  kind: 'damage' | 'block' | 'heal' | 'status' | 'enemyAttack' | 'death';
  /** 'player' またはエネミー uid */
  target: string;
  amount?: number;
  label?: string;
}

export interface BattleState {
  enemies: EnemyInstance[];
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  energy: number;
  maxEnergy: number;
  block: number;
  focus: number;
  playerWeak: number;
  turn: number;
  phase: BattlePhase;
  /** 敵ターン処理中：次に行動する敵 index */
  enemyCursor: number;
  /** パワー累積 */
  powers: {
    autoDamage: number;
    autoDraw: number;
    autoBlock: number;
    autoHeal: number;
    autoFocus: number;
  };
  fx: FxEvent[];
  fxCounter: number;
  isElite: boolean;
  isBoss: boolean;
}

/*──────────── マップ ────────────*/

export type NodeKind = 'battle' | 'elite' | 'event' | 'study' | 'rest' | 'boss';

export interface MapNode {
  id: string;
  row: number;
  col: number;
  kind: NodeKind;
  /** 次の行で進める node id */
  next: string[];
}

export interface ActMap {
  act: number;
  rows: number;
  nodes: MapNode[];
}

/*──────────── イベント ────────────*/

export interface EventChoiceEffect {
  heal?: number;
  damage?: number;
  maxHp?: number;
  /** 指定レアリティのランダムカードを獲得 */
  addCardRarity?: CardRarity;
  /** カード1枚を選んで強化（ピッカーを開く） */
  upgradePick?: boolean;
  /** カード1枚を選んで除去（ピッカーを開く） */
  removePick?: boolean;
  /** ランダム1枚を別カードに変化 */
  transformRandom?: boolean;
  /** 通常のカード報酬（3択）を開く */
  rewardCards?: boolean;
}

export interface EventChoice {
  label: string;
  detail: string;
  effect: EventChoiceEffect;
}

export interface RunEventDef {
  id: string;
  name: string;
  glyph: string;
  text: string;
  choices: EventChoice[];
}

/*──────────── 昇進パーク ────────────*/

export interface PerkDef {
  id: string;
  name: string;
  role: string; // 演出用の肩書き
  glyph: string;
  text: string;
  effect: {
    maxHp?: number;
    healToFull?: boolean;
    heal?: number;
    /** 戦闘開始時ブロック */
    battleStartBlock?: number;
    /** 戦闘開始時集中 */
    battleStartFocus?: number;
    /** 毎ターンの手札+1 */
    extraDraw?: number;
    /** カード報酬の SR 出現率2倍 */
    srLuck?: boolean;
  };
}

/*──────────── アーキタイプ（開始デッキ） ────────────*/

export interface ArchetypeDef {
  id: string;
  name: string;
  description: string;
  glyph: string;
  color: string;
  /** [defId, upgraded] の配列 */
  deck: Array<[string, boolean]>;
}

/*──────────── ラン進行 ────────────*/

export type RunView =
  | 'map'
  | 'battle'
  | 'reward'
  | 'event'
  | 'study'
  | 'rest'
  | 'perk';

export type PickerMode = 'upgrade' | 'remove';

export interface RunStats {
  battlesWon: number;
  bugsSquashed: number;
  damageDealt: number;
  cardsAdded: number;
  floorsClimbed: number;
}

export interface ScoreResult {
  finalScore: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  victory: boolean;
  breakdown: {
    progressScore: number;
    hpScore: number;
    huntScore: number;
    deckScore: number;
  };
}

export interface EncounterDef {
  /** enemy def ids（同一 id 複数可） */
  enemies: string[];
}

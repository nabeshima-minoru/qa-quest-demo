// QA Quest デモ版 共通型定義

export type RoleId =
  | 'tester'
  | 'test_leader'
  | 'test_manager'
  | 'consultant'
  | 'director'
  | 'ceo';

export type EventCategory = 'case' | 'study' | 'trouble' | 'social' | 'hidden';

export type ChoiceQuality = 'optimal' | 'good' | 'average' | 'suboptimal' | 'poor';

export type StatKey = 'tech' | 'comm' | 'analysis' | 'mgmt' | 'ai';

export type Stats = Record<StatKey, number>;

export interface ChoiceEffects {
  tech?: number;
  comm?: number;
  analysis?: number;
  mgmt?: number;
  ai?: number;
  wallet?: number;
  exp?: number;
  flag?: string;
}

export interface Choice {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  quality: ChoiceQuality;
  isOptimal?: boolean;
  effects: ChoiceEffects;
}

export interface TriggerConditions {
  minLevel?: number;
  maxLevel?: number;
  roles?: RoleId[];
  routes?: string[];
  stats?: Partial<Stats>;
  flags?: string[];
}

export interface GameEvent {
  id: string;
  category: EventCategory;
  title: string;
  description: string;
  mentorId: string | null;
  triggerConditions: TriggerConditions;
  weight: number;
  choices: Choice[];
  quizTrigger?: boolean;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  initialBonus: Partial<Stats>;
}

export interface Question {
  id: string;
  category: string;
  difficulty: number;
  questionText: string;
  choices: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  jstqbSyllabus: string;
  timeLimitSec: number;
}

export interface TurnLog {
  turn: number;
  eventId: string;
  eventTitle: string;
  choiceKey: 'A' | 'B' | 'C' | 'D';
  choiceText: string;
  quality: ChoiceQuality;
  expGain: number;
  effects: ChoiceEffects;
}

export interface ScoreResult {
  finalScore: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    jstqbScore: number;
    bugQualityAvg: number;
    choiceScore: number;
    roleReachedScore: number;
  };
}

/*──────────────────────────────────────
  BOSS BATTLE
──────────────────────────────────────*/

export type BossArchetype =
  | 'dev_lead'      // 開発リーダー
  | 'backend_lead'  // バックエンド責任者
  | 'product_mgr'   // プロダクトマネージャー
  | 'cto';          // CTO

export interface BossChoice {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  damage: number;
  reaction: string;
  quality: 'optimal' | 'good' | 'average' | 'poor';
}

export interface BossPhase {
  /** ボスの要求／台詞 */
  demand: string;
  /** プレイヤーの回答候補 */
  choices: BossChoice[];
}

export interface Boss {
  id: string;
  archetype: BossArchetype;
  name: string;
  title: string;
  /** どのマイルストーンで登場するか (10/20/30/40) */
  milestone: number;
  maxHp: number;
  /** SVG テーマカラー */
  themeColor: string;
  /** バトル開始時の挨拶 */
  intro: string;
  /** 撃破時の捨て台詞 */
  victory: string;
  /** 撤退（時間切れ）時の台詞 */
  escape: string;
  phases: BossPhase[]; // 3 phases
}

export interface BossChoiceLog {
  phase: number; // 1-3
  choiceKey: 'A' | 'B' | 'C' | 'D';
  choiceText: string;
  damage: number;
  quality: BossChoice['quality'];
}

export interface BossBattleState {
  bossId: string;
  milestone: number;
  hp: number;
  maxHp: number;
  /** 現在フェーズ 1〜3 */
  phase: number;
  /** 解決待ちの直近選択（次へ進む前のリアクション表示用） */
  pending: {
    choiceKey: BossChoice['key'];
    damage: number;
    reaction: string;
    quality: BossChoice['quality'];
  } | null;
  log: BossChoiceLog[];
  result: 'defeated' | 'escaped' | null;
}

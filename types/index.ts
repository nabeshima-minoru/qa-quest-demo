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

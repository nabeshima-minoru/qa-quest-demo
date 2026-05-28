// QA Quest ゲーム状態の Zustand ストア

import { create } from 'zustand';
import { BALANCE } from '@/lib/constants';
import {
  applyStatEffects,
  calcExpGain,
  calcLevelUp,
  calculateFinalScore,
  determineRole,
  generateSessionId,
  getQualityWeight,
  pickNextEvent,
} from '@/lib/gameLogic';
import { findRoute } from '@/data/routes';
import { findBossByMilestone, findBossById } from '@/data/bosses';
import { clearStorage, loadFromStorage, saveToStorage } from '@/lib/storage';
import type {
  BossBattleState,
  BossChoice,
  Choice,
  GameEvent,
  RoleId,
  ScoreResult,
  Stats,
  TurnLog,
} from '@/types';

export interface GameStateSlice {
  // セッション
  sessionId: string;
  routeId: string;
  currentTurn: number;
  status: 'idle' | 'in_progress' | 'completed';

  // プレイヤー
  level: number;
  totalExp: number;
  skillPoints: number;
  currentRole: RoleId;
  wallet: number;

  // ステータス
  stats: Stats;

  // 履歴・統計
  actionLog: TurnLog[];
  optimalCount: number;
  qualityWeightedSum: number;
  bugsFound: number;
  quizCorrect: number;
  quizAttempted: number;

  // 状態
  currentEvent: GameEvent | null;
  flags: Record<string, number>;

  // 演出フラグ
  pendingRoleUp: { from: RoleId; to: RoleId } | null;
  pendingQuiz: boolean;
  /** 中間総括ページに遷移すべきか（直近完了したマイルストーンターン: 10/20/30/40） */
  pendingRecap: number | null;
  /** BOSS 戦進行中の状態。null=非戦闘 */
  bossBattle: BossBattleState | null;
  /** 直近 BOSS 戦結果を保持（recap で参照） */
  lastBossResult: BossBattleState | null;
  /** 全ボス戦の履歴（最終結果ページで参照） */
  bossHistory: BossBattleState[];

  // 結果
  scoreResult: ScoreResult | null;
}

interface GameActions {
  /** 永続化されたセッションを復元（クライアントでのみ呼ぶ） */
  hydrate: () => void;
  startSession: (routeId: string) => void;
  submitChoice: (choiceKey: Choice['key']) => void;
  recordQuizResult: (correctCount: number, attemptedCount: number) => void;
  clearRoleUp: () => void;
  clearQuiz: () => void;
  clearRecap: () => void;
  /** BOSS バトル：選択肢を送信（damage + reaction を pending に格納） */
  submitBossChoice: (choiceKey: BossChoice['key']) => void;
  /** BOSS バトル：reaction 確認後に次フェーズへ進む / フェーズ3後は結果確定 */
  advanceBossPhase: () => void;
  /** BOSS バトル：結果確定後に終了処理（報酬付与＋recap発火） */
  finishBoss: () => void;
  reset: () => void;
}

const initialState: GameStateSlice = {
  sessionId: '',
  routeId: '',
  currentTurn: 0,
  status: 'idle',
  level: 1,
  totalExp: 0,
  skillPoints: 0,
  currentRole: 'tester',
  wallet: BALANCE.INITIAL_WALLET,
  stats: { ...BALANCE.INITIAL_STATS },
  actionLog: [],
  optimalCount: 0,
  qualityWeightedSum: 0,
  bugsFound: 0,
  quizCorrect: 0,
  quizAttempted: 0,
  currentEvent: null,
  flags: {},
  pendingRoleUp: null,
  pendingQuiz: false,
  pendingRecap: null,
  bossBattle: null,
  lastBossResult: null,
  bossHistory: [],
  scoreResult: null,
};

const RECAP_MILESTONES = [10, 20, 30, 40] as const;

/** BOSS 戦勝敗ボーナス（撃破: 大盤振る舞い、撤退: 申し訳程度） */
const BOSS_REWARD = {
  defeatedExp: 250,
  defeatedWallet: 30000,
  escapedExp: 60,
  escapedWallet: 0,
} as const;

/** ストア state のうち永続化する部分（currentEvent 等は再抽選可能なので除外しても可だが、UX 上保存する） */
type Persisted = GameStateSlice;

function persist(state: GameStateSlice) {
  const snapshot: Persisted = { ...state };
  saveToStorage(snapshot);
}

export const useGameStore = create<GameStateSlice & GameActions>((set, get) => ({
  ...initialState,

  hydrate: () => {
    const saved = loadFromStorage<Persisted>();
    if (saved && saved.sessionId) {
      set({ ...initialState, ...saved });
    }
  },

  startSession: (routeId: string) => {
    const route = findRoute(routeId);
    const bonus = route?.initialBonus ?? {};
    const stats: Stats = {
      tech: BALANCE.INITIAL_STATS.tech + (bonus.tech ?? 0),
      comm: BALANCE.INITIAL_STATS.comm + (bonus.comm ?? 0),
      analysis: BALANCE.INITIAL_STATS.analysis + (bonus.analysis ?? 0),
      mgmt: BALANCE.INITIAL_STATS.mgmt + (bonus.mgmt ?? 0),
      ai: BALANCE.INITIAL_STATS.ai + (bonus.ai ?? 0),
    };

    const fresh: GameStateSlice = {
      ...initialState,
      sessionId: generateSessionId(),
      routeId,
      currentTurn: 1,
      status: 'in_progress',
      stats,
    };

    // 最初のイベントを抽選
    const first = pickNextEvent({
      level: fresh.level,
      stats: fresh.stats,
      role: fresh.currentRole,
      routeId: fresh.routeId,
      flags: fresh.flags,
      usedEventIds: [],
    });
    fresh.currentEvent = first;

    set(fresh);
    persist(fresh);
  },

  submitChoice: (choiceKey) => {
    const s = get();
    if (s.status !== 'in_progress' || !s.currentEvent) return;
    const event = s.currentEvent;
    const choice = event.choices.find((c) => c.key === choiceKey);
    if (!choice) return;

    // 1. ステータス適用
    const newStats = applyStatEffects(s.stats, choice.effects);

    // 2. EXP
    const expGain = calcExpGain(choice);
    const newTotalExp = s.totalExp + expGain;

    // 3. wallet
    const newWallet = Math.max(0, s.wallet + (choice.effects.wallet ?? 0));

    // 4. レベルアップ判定
    const { newLevel, spGain } = calcLevelUp(s.level, newTotalExp);

    // 5. ロール昇格判定
    const fromRole = s.currentRole;
    const toRole = determineRole(newLevel, newStats);
    const pendingRoleUp = toRole !== fromRole ? { from: fromRole, to: toRole } : null;

    // 6. 質スコア・最適カウント
    const qWeight = getQualityWeight(choice);
    const newOptimal = s.optimalCount + (choice.isOptimal ? 1 : 0);
    const newQualitySum = s.qualityWeightedSum + qWeight;

    // 7. ログ
    const log: TurnLog = {
      turn: s.currentTurn,
      eventId: event.id,
      eventTitle: event.title,
      choiceKey: choice.key,
      choiceText: choice.text,
      quality: choice.quality,
      expGain,
      effects: choice.effects,
    };

    // 8. flag 反映
    const newFlags = { ...s.flags };
    if (choice.effects.flag) {
      newFlags[choice.effects.flag] = (newFlags[choice.effects.flag] ?? 0) + 1;
    }

    // 9. ターン進行 / 次イベント / クイズ発火 / BOSS発火（総括は BOSS 後に発火）
    const nextTurn = s.currentTurn + 1;
    const completed = nextTurn > BALANCE.MAX_TURNS;
    const pendingQuiz = !!event.quizTrigger;
    // 完了したターンが 10/20/30/40 なら BOSS 戦を発火（最終ターン50は除外）
    const finishedTurn = s.currentTurn;
    const isMilestone =
      !completed && (RECAP_MILESTONES as readonly number[]).includes(finishedTurn);
    const milestoneBoss = isMilestone ? findBossByMilestone(finishedTurn) : null;
    const newBossBattle: BossBattleState | null = milestoneBoss
      ? {
          bossId: milestoneBoss.id,
          milestone: finishedTurn,
          hp: milestoneBoss.maxHp,
          maxHp: milestoneBoss.maxHp,
          phase: 1,
          pending: null,
          log: [],
          result: null,
        }
      : null;
    // pendingRecap は BOSS 戦終了後に finishBoss でセット。マイルストーン以外では null
    const pendingRecap = null;

    let nextEvent: GameEvent | null = null;
    let scoreResult: ScoreResult | null = null;

    if (completed) {
      scoreResult = calculateFinalScore({
        quizCorrect: s.quizCorrect,
        quizAttempted: s.quizAttempted,
        bugsFound: s.bugsFound,
        qualityWeightedSum: newQualitySum,
        currentRole: toRole,
      });
    } else {
      nextEvent = pickNextEvent({
        level: newLevel,
        stats: newStats,
        role: toRole,
        routeId: s.routeId,
        flags: newFlags,
        usedEventIds: [...s.actionLog.map((l) => l.eventId), event.id],
      });
    }

    const updated: GameStateSlice = {
      ...s,
      stats: newStats,
      totalExp: newTotalExp,
      level: newLevel,
      skillPoints: s.skillPoints + spGain,
      wallet: newWallet,
      currentRole: toRole,
      currentTurn: completed ? BALANCE.MAX_TURNS : nextTurn,
      status: completed ? 'completed' : 'in_progress',
      actionLog: [...s.actionLog, log],
      optimalCount: newOptimal,
      qualityWeightedSum: newQualitySum,
      flags: newFlags,
      currentEvent: nextEvent,
      pendingRoleUp,
      pendingQuiz,
      pendingRecap,
      bossBattle: newBossBattle,
      scoreResult,
    };

    set(updated);
    persist(updated);
  },

  recordQuizResult: (correctCount, attemptedCount) => {
    const s = get();
    const updated: GameStateSlice = {
      ...s,
      quizCorrect: s.quizCorrect + correctCount,
      quizAttempted: s.quizAttempted + attemptedCount,
      // クイズ完了で疑似的にバグ発見数を増加（デモ向け簡易計算）
      bugsFound: s.bugsFound + correctCount,
      pendingQuiz: false,
    };
    set(updated);
    persist(updated);
  },

  clearRoleUp: () => {
    const s = get();
    set({ ...s, pendingRoleUp: null });
    persist({ ...s, pendingRoleUp: null });
  },

  clearQuiz: () => {
    const s = get();
    set({ ...s, pendingQuiz: false });
    persist({ ...s, pendingQuiz: false });
  },

  clearRecap: () => {
    const s = get();
    set({ ...s, pendingRecap: null });
    persist({ ...s, pendingRecap: null });
  },

  submitBossChoice: (choiceKey) => {
    const s = get();
    if (!s.bossBattle || s.bossBattle.result || s.bossBattle.pending) return;
    const boss = findBossById(s.bossBattle.bossId);
    if (!boss) return;
    const phaseData = boss.phases[s.bossBattle.phase - 1];
    if (!phaseData) return;
    const choice = phaseData.choices.find((c) => c.key === choiceKey);
    if (!choice) return;

    const newHp = Math.max(0, s.bossBattle.hp - choice.damage);
    const log = [
      ...s.bossBattle.log,
      {
        phase: s.bossBattle.phase,
        choiceKey: choice.key,
        choiceText: choice.text,
        damage: choice.damage,
        quality: choice.quality,
      },
    ];

    const updated: BossBattleState = {
      ...s.bossBattle,
      hp: newHp,
      log,
      pending: {
        choiceKey: choice.key,
        damage: choice.damage,
        reaction: choice.reaction,
        quality: choice.quality,
      },
    };

    const next = { ...s, bossBattle: updated };
    set(next);
    persist(next);
  },

  advanceBossPhase: () => {
    const s = get();
    if (!s.bossBattle || !s.bossBattle.pending) return;
    const battle = s.bossBattle;

    // HP 0 で勝利確定
    if (battle.hp <= 0) {
      const finalized: BossBattleState = {
        ...battle,
        pending: null,
        result: 'defeated',
      };
      const next = { ...s, bossBattle: finalized };
      set(next);
      persist(next);
      return;
    }

    // フェーズ進行
    const nextPhase = battle.phase + 1;
    if (nextPhase > 3) {
      // 3 フェーズ消化、HP残り → 撤退
      const finalized: BossBattleState = {
        ...battle,
        pending: null,
        result: 'escaped',
      };
      const next = { ...s, bossBattle: finalized };
      set(next);
      persist(next);
      return;
    }

    const advanced: BossBattleState = {
      ...battle,
      phase: nextPhase,
      pending: null,
    };
    const next = { ...s, bossBattle: advanced };
    set(next);
    persist(next);
  },

  finishBoss: () => {
    const s = get();
    if (!s.bossBattle || !s.bossBattle.result) return;
    const battle = s.bossBattle;

    // 報酬付与
    const defeated = battle.result === 'defeated';
    const expGain = defeated ? BOSS_REWARD.defeatedExp : BOSS_REWARD.escapedExp;
    const walletGain = defeated
      ? BOSS_REWARD.defeatedWallet
      : BOSS_REWARD.escapedWallet;
    const newTotalExp = s.totalExp + expGain;
    const { newLevel, spGain } = calcLevelUp(s.level, newTotalExp);
    const newRole = determineRole(newLevel, s.stats);
    const pendingRoleUp =
      newRole !== s.currentRole ? { from: s.currentRole, to: newRole } : null;

    const updated: GameStateSlice = {
      ...s,
      totalExp: newTotalExp,
      level: newLevel,
      skillPoints: s.skillPoints + spGain,
      wallet: s.wallet + walletGain,
      currentRole: newRole,
      pendingRoleUp: pendingRoleUp ?? s.pendingRoleUp,
      bossBattle: null,
      lastBossResult: battle,
      // 履歴に追記（同じ milestone がすでにあれば置換、無ければ追加）
      bossHistory: [
        ...s.bossHistory.filter((b) => b.milestone !== battle.milestone),
        battle,
      ].sort((a, b) => a.milestone - b.milestone),
      // BOSS 戦終了後に総括ページへ
      pendingRecap: battle.milestone,
    };
    set(updated);
    persist(updated);
  },

  reset: () => {
    clearStorage();
    set({ ...initialState });
  },
}));

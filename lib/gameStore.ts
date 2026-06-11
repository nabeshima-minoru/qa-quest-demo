// QA Quest — Success Mode の Zustand ストア
// 週単位の訓練 → 武器収集・成長 → 章末ボスと武器コマンドバトル。

import { create } from 'zustand';
import { BALANCE } from '@/lib/constants';
import {
  calcFinalScore,
  chapterOfWeek,
  clampStat,
  computeAttack,
  determineRole,
  effectiveStats,
  generateSessionId,
  grantWeapon,
  isBossWeek,
  resolveTraining,
  rollWeekEvent,
} from '@/lib/successLogic';
import { findRoute } from '@/data/routes';
import { findTraining } from '@/data/trainings';
import { findWeapon, TROPHY_BY_CHAPTER } from '@/data/weapons';
import { findBossById, findBossByWeek } from '@/data/successBosses';
import { clearStorage, loadFromStorage, saveToStorage } from '@/lib/storage';
import type {
  BattleResult,
  BattleState,
  OwnedWeapon,
  RoleId,
  ScoreResult,
  Stats,
  StatKey,
  WeekEventOutcome,
  WeekResolution,
} from '@/types';

const STAT_KEYS: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];
const BATTLE_TURN_CAP = 16;

export interface GameStateSlice {
  sessionId: string;
  routeId: string;
  status: 'idle' | 'in_progress' | 'completed';

  // 進行
  week: number; // 1..36
  chapter: number; // 1..3

  // プレイヤー
  stats: Stats; // 訓練で育てた素ステータス（武器パッシブは含まない）
  stamina: number;
  weapons: OwnedWeapon[];
  currentRole: RoleId;

  // 章スナップショット（総括の成長差分用）
  chapterStartStats: Stats;
  chapterGainedWeaponIds: string[];

  // 週の処理結果（ハブで表示中）
  weekResolution: WeekResolution | null;

  // バトル
  battle: BattleState | null;
  battleHistory: BattleResult[];

  // 演出フラグ
  pendingRoleUp: { from: RoleId; to: RoleId } | null;
  /** 章末総括を表示すべき章番号（null=非表示） */
  pendingRecap: number | null;

  // 結果
  scoreResult: ScoreResult | null;
}

interface GameActions {
  hydrate: () => void;
  startSession: (routeId: string) => void;
  /** 訓練コマンドを実行 → weekResolution に結果を格納 */
  doTraining: (trainingId: string) => void;
  /** 週イベント（選択式）の選択を確定 */
  resolveWeekEventChoice: (key: 'A' | 'B') => void;
  /** 次の週へ進む（weekResolution をクリア） */
  advanceWeek: () => void;
  /** 章末ボス戦を開始 */
  startBattle: () => void;
  /** 武器を選んで攻撃 */
  submitWeaponAttack: (weaponId: string) => void;
  /** 攻撃演出確認後に次ターン or 勝敗確定 */
  advanceBattle: () => void;
  /** バトル終了処理（戦利品付与＋総括発火） */
  finishBattle: () => void;
  clearRoleUp: () => void;
  clearRecap: () => void;
  reset: () => void;
}

const initialState: GameStateSlice = {
  sessionId: '',
  routeId: '',
  status: 'idle',
  week: 1,
  chapter: 1,
  stats: { ...BALANCE.INITIAL_STATS },
  stamina: BALANCE.INITIAL_STAMINA,
  weapons: [],
  currentRole: 'tester',
  chapterStartStats: { ...BALANCE.INITIAL_STATS },
  chapterGainedWeaponIds: [],
  weekResolution: null,
  battle: null,
  battleHistory: [],
  pendingRoleUp: null,
  pendingRecap: null,
  scoreResult: null,
};

type Persisted = GameStateSlice;

function persist(state: GameStateSlice) {
  saveToStorage<Persisted>({ ...state });
}

function clampStamina(v: number): number {
  return Math.max(0, Math.min(BALANCE.MAX_STAMINA, Math.round(v)));
}

function applyStatDelta(stats: Stats, delta: Partial<Stats>): Stats {
  const next: Stats = { ...stats };
  for (const k of STAT_KEYS) {
    const d = delta[k];
    if (d) next[k] = clampStat(next[k] + d);
  }
  return next;
}

/** 週イベントの結果を state に適用（stats/stamina/weapon） */
function applyOutcome(
  stats: Stats,
  stamina: number,
  weapons: OwnedWeapon[],
  chapterGained: string[],
  outcome: WeekEventOutcome
): { stats: Stats; stamina: number; weapons: OwnedWeapon[]; chapterGained: string[] } {
  let nextStats = stats;
  if (outcome.stats) nextStats = applyStatDelta(stats, outcome.stats);
  let nextStamina = stamina;
  if (outcome.stamina) nextStamina = clampStamina(stamina + outcome.stamina);
  let nextWeapons = weapons;
  const nextGained = [...chapterGained];
  if (outcome.grantWeaponId) {
    const g = grantWeapon(weapons, outcome.grantWeaponId);
    nextWeapons = g.owned;
    nextGained.push(outcome.grantWeaponId);
  }
  return { stats: nextStats, stamina: nextStamina, weapons: nextWeapons, chapterGained: nextGained };
}

function reactionText(matched: boolean, damage: number): string {
  if (matched) {
    return damage >= 90
      ? 'ぐっ……！ 完全に急所を突かれた。'
      : 'うっ……痛いところを突いてくるな。';
  }
  return damage >= 55
    ? 'ほう、悪くない。だが決定打にはならんな。'
    : 'その程度か。痛くも痒くもない。';
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
      tech: clampStat(BALANCE.INITIAL_STATS.tech + (bonus.tech ?? 0)),
      comm: clampStat(BALANCE.INITIAL_STATS.comm + (bonus.comm ?? 0)),
      analysis: clampStat(BALANCE.INITIAL_STATS.analysis + (bonus.analysis ?? 0)),
      mgmt: clampStat(BALANCE.INITIAL_STATS.mgmt + (bonus.mgmt ?? 0)),
      ai: clampStat(BALANCE.INITIAL_STATS.ai + (bonus.ai ?? 0)),
    };

    // スタート武器：知識・技術・人脈を1つずつ（最初のボスから3系統で戦える）
    const weapons: OwnedWeapon[] = [
      { id: 'WPN-K-JSTQB', level: 1 },
      { id: 'WPN-T-SELENIUM', level: 1 },
      { id: 'WPN-C-TRUST', level: 1 },
    ];

    const fresh: GameStateSlice = {
      ...initialState,
      sessionId: generateSessionId(),
      routeId,
      status: 'in_progress',
      week: 1,
      chapter: 1,
      stats,
      stamina: BALANCE.INITIAL_STAMINA,
      weapons,
      currentRole: determineRole(stats),
      chapterStartStats: { ...stats },
      chapterGainedWeaponIds: [],
    };

    set(fresh);
    persist(fresh);
  },

  doTraining: (trainingId) => {
    const s = get();
    if (s.status !== 'in_progress') return;
    if (isBossWeek(s.week)) return;
    if (s.weekResolution) return; // 既に解決済み → advanceWeek を待つ
    const training = findTraining(trainingId);
    if (!training) return;

    const res = resolveTraining(training, s.stamina, s.weapons.map((o) => o.id));

    let stats = applyStatDelta(s.stats, res.statDelta);
    let stamina = clampStamina(s.stamina + res.staminaDelta);
    let weapons = s.weapons;
    let chapterGained = [...s.chapterGainedWeaponIds];

    let weaponLevelUp = false;
    if (res.gainedWeaponId) {
      const g = grantWeapon(weapons, res.gainedWeaponId);
      weapons = g.owned;
      weaponLevelUp = g.levelUp;
      chapterGained.push(res.gainedWeaponId);
    }

    // 週イベント抽選
    const ev = rollWeekEvent();
    let eventPending = false;
    let eventResult: WeekEventOutcome | null = null;
    if (ev) {
      if (ev.tone === 'choice') {
        eventPending = true;
      } else if (ev.outcome) {
        const applied = applyOutcome(stats, stamina, weapons, chapterGained, ev.outcome);
        stats = applied.stats;
        stamina = applied.stamina;
        weapons = applied.weapons;
        chapterGained = applied.chapterGained;
        eventResult = ev.outcome;
      }
    }

    const role = determineRole(stats);
    const pendingRoleUp =
      role !== s.currentRole ? { from: s.currentRole, to: role } : s.pendingRoleUp;

    const weekResolution: WeekResolution = {
      week: s.week,
      trainingId: training.id,
      trainingName: training.name,
      statDelta: res.statDelta,
      staminaDelta: stamina - s.stamina,
      slump: res.slump,
      gainedWeaponId: res.gainedWeaponId,
      weaponLevelUp,
      event: ev,
      eventPending,
      eventResult,
    };

    const updated: GameStateSlice = {
      ...s,
      stats,
      stamina,
      weapons,
      currentRole: role,
      pendingRoleUp,
      chapterGainedWeaponIds: chapterGained,
      weekResolution,
    };
    set(updated);
    persist(updated);
  },

  resolveWeekEventChoice: (key) => {
    const s = get();
    const wr = s.weekResolution;
    if (!wr || !wr.event || !wr.eventPending) return;
    const choice = wr.event.choices?.find((c) => c.key === key);
    if (!choice) return;

    const applied = applyOutcome(
      s.stats,
      s.stamina,
      s.weapons,
      s.chapterGainedWeaponIds,
      choice.outcome
    );
    const role = determineRole(applied.stats);
    const pendingRoleUp =
      role !== s.currentRole ? { from: s.currentRole, to: role } : s.pendingRoleUp;

    const updated: GameStateSlice = {
      ...s,
      stats: applied.stats,
      stamina: applied.stamina,
      weapons: applied.weapons,
      chapterGainedWeaponIds: applied.chapterGained,
      currentRole: role,
      pendingRoleUp,
      weekResolution: { ...wr, eventPending: false, eventResult: choice.outcome },
    };
    set(updated);
    persist(updated);
  },

  advanceWeek: () => {
    const s = get();
    if (!s.weekResolution || s.weekResolution.eventPending) return;
    const nextWeek = Math.min(BALANCE.MAX_WEEKS, s.week + 1);
    const updated: GameStateSlice = {
      ...s,
      week: nextWeek,
      chapter: chapterOfWeek(nextWeek),
      weekResolution: null,
    };
    set(updated);
    persist(updated);
  },

  startBattle: () => {
    const s = get();
    if (s.status !== 'in_progress' || s.battle) return;
    if (!isBossWeek(s.week)) return;
    const boss = findBossByWeek(s.week);
    if (!boss) return;

    const battle: BattleState = {
      bossId: boss.id,
      chapter: boss.chapter,
      bossHp: boss.maxHp,
      bossMaxHp: boss.maxHp,
      playerMental: BALANCE.PLAYER_MAX_MENTAL,
      playerMaxMental: BALANCE.PLAYER_MAX_MENTAL,
      turn: 1,
      demandIndex: 0,
      log: [],
      pending: null,
      result: null,
    };
    set({ ...s, battle });
    persist({ ...s, battle });
  },

  submitWeaponAttack: (weaponId) => {
    const s = get();
    const b = s.battle;
    if (!b || b.pending || b.result) return;
    const boss = findBossById(b.bossId);
    if (!boss) return;
    const demand = boss.demands[b.demandIndex % boss.demands.length];
    const owned = s.weapons.find((o) => o.id === weaponId);
    const weapon = findWeapon(weaponId);
    if (!owned || !weapon) return;

    const eff = effectiveStats(s.stats, s.weapons);
    const atk = computeAttack(
      weapon,
      owned.level,
      eff,
      demand.weakCategory,
      demand.mentalDamage
    );

    const newBossHp = Math.max(0, b.bossHp - atk.damageDealt);
    const newMental = Math.max(0, b.playerMental - atk.mentalTaken);

    const battle: BattleState = {
      ...b,
      bossHp: newBossHp,
      playerMental: newMental,
      log: [
        ...b.log,
        {
          turn: b.turn,
          weaponId,
          weaponName: weapon.name,
          matched: atk.matched,
          damageDealt: atk.damageDealt,
          mentalTaken: atk.mentalTaken,
        },
      ],
      pending: {
        weaponId,
        weaponName: weapon.name,
        matched: atk.matched,
        damageDealt: atk.damageDealt,
        mentalTaken: atk.mentalTaken,
        reaction: reactionText(atk.matched, atk.damageDealt),
      },
    };
    set({ ...s, battle });
    persist({ ...s, battle });
  },

  advanceBattle: () => {
    const s = get();
    const b = s.battle;
    if (!b || !b.pending) return;
    const boss = findBossById(b.bossId);
    const demandsLen = boss?.demands.length ?? 3;

    let battle: BattleState;
    if (b.bossHp <= 0) {
      battle = { ...b, pending: null, result: 'win' };
    } else if (b.playerMental <= 0 || b.turn >= BATTLE_TURN_CAP) {
      battle = { ...b, pending: null, result: 'lose' };
    } else {
      const nextTurn = b.turn + 1;
      battle = {
        ...b,
        turn: nextTurn,
        demandIndex: (nextTurn - 1) % demandsLen,
        pending: null,
      };
    }
    set({ ...s, battle });
    persist({ ...s, battle });
  },

  finishBattle: () => {
    const s = get();
    const b = s.battle;
    if (!b || !b.result) return;

    const win = b.result === 'win';
    const result: BattleResult = {
      bossId: b.bossId,
      chapter: b.chapter,
      result: b.result,
      bossMaxHp: b.bossMaxHp,
      remainingBossHp: b.bossHp,
      remainingMental: b.playerMental,
      playerMaxMental: b.playerMaxMental,
      turnsTaken: b.turn,
    };

    let weapons = s.weapons;
    const chapterGained = [...s.chapterGainedWeaponIds];
    if (win) {
      const trophyId = TROPHY_BY_CHAPTER[b.chapter];
      if (trophyId) {
        const g = grantWeapon(weapons, trophyId);
        weapons = g.owned;
        chapterGained.push(trophyId);
      }
    }

    const battleHistory = [
      ...s.battleHistory.filter((h) => h.chapter !== b.chapter),
      result,
    ].sort((a, c) => a.chapter - c.chapter);

    const role = determineRole(s.stats);
    const pendingRoleUp =
      role !== s.currentRole ? { from: s.currentRole, to: role } : s.pendingRoleUp;

    const completed = b.chapter >= 3;
    const bossWeek = s.week;
    const nextWeek = completed ? BALANCE.MAX_WEEKS : Math.min(BALANCE.MAX_WEEKS, bossWeek + 1);

    let scoreResult = s.scoreResult;
    if (completed) {
      scoreResult = calcFinalScore({
        stats: s.stats,
        owned: weapons,
        battles: battleHistory,
        role,
      });
    }

    const updated: GameStateSlice = {
      ...s,
      weapons,
      currentRole: role,
      pendingRoleUp,
      chapterGainedWeaponIds: chapterGained,
      battle: null,
      battleHistory,
      pendingRecap: b.chapter,
      week: nextWeek,
      chapter: chapterOfWeek(nextWeek),
      status: completed ? 'completed' : 'in_progress',
      scoreResult,
    };
    set(updated);
    persist(updated);
  },

  clearRoleUp: () => {
    const s = get();
    const updated = { ...s, pendingRoleUp: null };
    set(updated);
    persist(updated);
  },

  clearRecap: () => {
    const s = get();
    // 次章のベースラインを記録（成長差分計算用）
    const updated: GameStateSlice = {
      ...s,
      pendingRecap: null,
      chapterStartStats: { ...s.stats },
      chapterGainedWeaponIds: [],
    };
    set(updated);
    persist(updated);
  },

  reset: () => {
    clearStorage();
    set({ ...initialState });
  },
}));

'use client';

// QA Quest — ラン進行ストア（Zustand）
// 1 ラン = 3 幕のローグライク。localStorage に全状態を保存。

import { create } from 'zustand';
import { BALANCE } from '@/lib/constants';
import {
  beginPlayerTurn,
  createBattle,
  endPlayerTurn,
  nextUid,
  playCard,
  stepEnemyTurn,
} from '@/lib/battle';
import { generateActMap, findNode } from '@/lib/mapGen';
import { clearStorage, loadFromStorage, saveToStorage } from '@/lib/storage';
import { findCard, poolByRarity } from '@/data/cards';
import { ACT_ENCOUNTERS } from '@/data/enemies';
import { runEvents } from '@/data/runEvents';
import { findArchetype, findPerk, perks } from '@/data/perks';
import type {
  ActMap,
  BattleState,
  CardInstance,
  CardRarity,
  NodeKind,
  PickerMode,
  RunStats,
  RunView,
  ScoreResult,
} from '@/types';

/*──────────── 状態 ────────────*/

interface RunSlice {
  status: 'idle' | 'run' | 'result';
  view: RunView;
  archetypeId: string | null;
  act: number;
  map: ActMap | null;
  positionId: string | null;
  hp: number;
  maxHp: number;
  deck: CardInstance[];
  perkIds: string[];
  battle: BattleState | null;
  battleKind: NodeKind | null;
  /** 報酬の選択肢（カード defId） */
  rewardCards: string[] | null;
  /** 報酬確定後の遷移先 */
  afterReward: 'map' | 'perk' | 'victory' | null;
  /** 昇進の選択肢 */
  perkChoices: string[] | null;
  eventId: string | null;
  /** イベント/休憩の結果テキスト（null = 未解決） */
  resultText: string | null;
  /** カードピッカー（強化/除去）。view に重ねて表示 */
  picker: PickerMode | null;
  stats: RunStats;
  score: ScoreResult | null;
}

interface RunActions {
  hydrate: () => void;
  reset: () => void;
  startRun: (archetypeId: string) => void;
  enterNode: (nodeId: string) => void;
  playCardAction: (handIndex: number, targetUid: string | null) => void;
  endTurnAction: () => void;
  stepEnemy: () => void;
  pickReward: (defId: string | null) => void;
  chooseEventOption: (index: number) => void;
  continueFromResult: () => void;
  restAction: () => void;
  studyChoose: (mode: PickerMode) => void;
  applyPick: (uid: string) => void;
  cancelPicker: () => void;
  pickPerk: (perkId: string) => void;
  finishDefeat: () => void;
}

const initialStats: RunStats = {
  battlesWon: 0,
  bugsSquashed: 0,
  damageDealt: 0,
  cardsAdded: 0,
  floorsClimbed: 0,
};

const initialState: RunSlice = {
  status: 'idle',
  view: 'map',
  archetypeId: null,
  act: 1,
  map: null,
  positionId: null,
  hp: BALANCE.PLAYER_MAX_HP,
  maxHp: BALANCE.PLAYER_MAX_HP,
  deck: [],
  perkIds: [],
  battle: null,
  battleKind: null,
  rewardCards: null,
  afterReward: null,
  perkChoices: null,
  eventId: null,
  resultText: null,
  picker: null,
  stats: initialStats,
  score: null,
};

type Persisted = RunSlice;

function persist(s: RunSlice) {
  saveToStorage<Persisted>({ ...s });
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/*──────────── パーク補助 ────────────*/

function perkEffects(perkIds: string[]) {
  let battleStartBlock = 0;
  let battleStartFocus = 0;
  let extraDraw = 0;
  let srLuck = false;
  for (const id of perkIds) {
    const p = findPerk(id);
    if (!p) continue;
    battleStartBlock += p.effect.battleStartBlock ?? 0;
    battleStartFocus += p.effect.battleStartFocus ?? 0;
    extraDraw += p.effect.extraDraw ?? 0;
    srLuck = srLuck || !!p.effect.srLuck;
  }
  return { battleStartBlock, battleStartFocus, extraDraw, srLuck };
}

/*──────────── 報酬抽選 ────────────*/

function pickRarity(weights: Record<CardRarity, number>, srLuck: boolean): CardRarity {
  const w = { ...weights };
  if (srLuck) w.SR *= 2;
  const total = w.N + w.R + w.SR;
  let r = Math.random() * total;
  for (const k of ['N', 'R', 'SR'] as CardRarity[]) {
    r -= w[k];
    if (r <= 0) return k;
  }
  return 'N';
}

function rollRewardCards(isEliteOrBoss: boolean, srLuck: boolean): string[] {
  const weights = isEliteOrBoss ? BALANCE.ELITE_RARITY_WEIGHTS : BALANCE.RARITY_WEIGHTS;
  const picked: string[] = [];
  let guard = 0;
  while (picked.length < BALANCE.REWARD_CHOICES && guard < 40) {
    guard++;
    const rarity = pickRarity(weights, srLuck);
    const pool = poolByRarity(rarity);
    if (pool.length === 0) continue;
    const card = rand(pool);
    if (picked.includes(card.id) && guard < 30) continue;
    picked.push(card.id);
  }
  return picked;
}

function randomCardByRarity(rarity: CardRarity): string {
  const pool = poolByRarity(rarity);
  return rand(pool).id;
}

/*──────────── スコア ────────────*/

const TOTAL_FLOORS =
  BALANCE.ACT_ROWS.reduce((s: number, r: number) => s + r, 0) + BALANCE.TOTAL_ACTS;

function computeScore(s: RunSlice, victory: boolean): ScoreResult {
  const progressScore = Math.min(100, (s.stats.floorsClimbed / TOTAL_FLOORS) * 100);
  const hpScore = victory ? Math.min(100, (s.hp / s.maxHp) * 100) : 0;
  const huntScore = Math.min(100, s.stats.bugsSquashed * 6);
  const deckPoints = s.deck.reduce((sum, c) => {
    const def = findCard(c.defId);
    const rp = def ? { N: 1, R: 2, SR: 3 }[def.rarity] : 0;
    return sum + rp + (c.upgraded ? 1 : 0);
  }, 0);
  const deckScore = Math.min(100, (deckPoints / 32) * 100);

  const w = BALANCE.SCORE_WEIGHTS;
  let finalScore =
    progressScore * w.progress + hpScore * w.hp + huntScore * w.hunt + deckScore * w.deck;
  if (victory) finalScore = Math.min(100, finalScore + 8); // 完走ボーナス

  const t = BALANCE.RANK_THRESHOLDS;
  const rank: ScoreResult['rank'] =
    finalScore >= t.S ? 'S' : finalScore >= t.A ? 'A' : finalScore >= t.B ? 'B' : finalScore >= t.C ? 'C' : 'D';

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    rank,
    victory,
    breakdown: {
      progressScore: Math.round(progressScore * 10) / 10,
      hpScore: Math.round(hpScore * 10) / 10,
      huntScore: Math.round(huntScore * 10) / 10,
      deckScore: Math.round(deckScore * 10) / 10,
    },
  };
}

/*──────────── ストア ────────────*/

export const useRunStore = create<RunSlice & RunActions>((set, get) => {
  /** バトル状態の変化後に勝敗を処理する共通ルーチン */
  function settleBattle(battle: BattleState, extra: Partial<RunSlice> = {}) {
    const s = get();
    if (battle.phase === 'won') {
      const { srLuck } = perkEffects(s.perkIds);
      const isEliteOrBoss = s.battleKind === 'elite' || s.battleKind === 'boss';
      const kills = battle.enemies.length;
      const stats: RunStats = {
        ...s.stats,
        battlesWon: s.stats.battlesWon + 1,
        bugsSquashed: s.stats.bugsSquashed + kills,
      };
      let afterReward: RunSlice['afterReward'] = 'map';
      if (s.battleKind === 'boss') {
        afterReward = s.act >= BALANCE.TOTAL_ACTS ? 'victory' : 'perk';
      }
      const updated: RunSlice = {
        ...s,
        ...extra,
        battle,
        stats,
        rewardCards: rollRewardCards(isEliteOrBoss, srLuck),
        afterReward,
      };
      set(updated);
      persist(updated);
      return true;
    }
    return false;
  }

  return {
    ...initialState,

    hydrate: () => {
      const saved = loadFromStorage<Persisted>();
      if (saved && saved.status && saved.status !== 'idle') {
        set({ ...initialState, ...saved });
      }
    },

    reset: () => {
      clearStorage();
      set({ ...initialState });
    },

    startRun: (archetypeId) => {
      const arch = findArchetype(archetypeId);
      if (!arch) return;
      const deck: CardInstance[] = arch.deck.map(([defId, upgraded]) => ({
        uid: nextUid('cd'),
        defId,
        upgraded,
      }));
      const fresh: RunSlice = {
        ...initialState,
        status: 'run',
        view: 'map',
        archetypeId,
        act: 1,
        map: generateActMap(1),
        positionId: null,
        hp: BALANCE.PLAYER_MAX_HP,
        maxHp: BALANCE.PLAYER_MAX_HP,
        deck,
        stats: { ...initialStats },
      };
      set(fresh);
      persist(fresh);
    },

    enterNode: (nodeId) => {
      const s = get();
      if (s.status !== 'run' || !s.map) return;
      const node = findNode(s.map, nodeId);
      if (!node) return;

      const stats = { ...s.stats, floorsClimbed: s.stats.floorsClimbed + 1 };
      let updated: RunSlice = { ...s, positionId: nodeId, stats, resultText: null };

      if (node.kind === 'battle' || node.kind === 'elite' || node.kind === 'boss') {
        const table = ACT_ENCOUNTERS[s.act - 1];
        const enc =
          node.kind === 'boss'
            ? table.boss
            : node.kind === 'elite'
              ? rand(table.elite)
              : rand(table.normal);
        const fx = perkEffects(s.perkIds);
        const battle = createBattle({
          deck: s.deck,
          enemyIds: enc.enemies,
          isElite: node.kind === 'elite',
          isBoss: node.kind === 'boss',
          startBlock: fx.battleStartBlock,
          startFocus: fx.battleStartFocus,
          extraDraw: fx.extraDraw,
        });
        updated = { ...updated, view: 'battle', battle, battleKind: node.kind };
      } else if (node.kind === 'event') {
        updated = { ...updated, view: 'event', eventId: rand(runEvents).id };
      } else if (node.kind === 'study') {
        updated = { ...updated, view: 'study' };
      } else if (node.kind === 'rest') {
        updated = { ...updated, view: 'rest' };
      }
      set(updated);
      persist(updated);
    },

    playCardAction: (handIndex, targetUid) => {
      const s = get();
      if (!s.battle) return;
      const res = playCard(s.battle, handIndex, targetUid);
      if (res.rejected) return;
      const stats = { ...s.stats, damageDealt: s.stats.damageDealt + res.damageDealt };
      // 回復・自傷をラン HP へ反映（自傷では倒れない：最低 1 残る）
      let hp = s.hp;
      if (res.heal) hp = Math.min(s.maxHp, hp + res.heal);
      if (res.selfDamage) hp = Math.max(1, hp - res.selfDamage);
      if (!settleBattle(res.state, { stats, hp })) {
        const updated = { ...s, battle: res.state, stats, hp };
        set(updated);
        persist(updated);
      }
    },

    endTurnAction: () => {
      const s = get();
      if (!s.battle || s.battle.phase !== 'player') return;
      const battle = endPlayerTurn(s.battle);
      const updated = { ...s, battle };
      set(updated);
      persist(updated);
    },

    stepEnemy: () => {
      const s = get();
      if (!s.battle || s.battle.phase !== 'enemy') return;
      const res = stepEnemyTurn(s.battle);
      const hp = Math.max(0, s.hp - res.hpLost);

      if (hp <= 0) {
        const battle = { ...res.state, phase: 'lost' as const };
        const updated = { ...s, hp: 0, battle };
        set(updated);
        persist(updated);
        return;
      }

      if (!res.hasNext) {
        const fx = perkEffects(s.perkIds);
        const turn = beginPlayerTurn(res.state, fx.extraDraw);
        const stats = {
          ...s.stats,
          damageDealt: s.stats.damageDealt + turn.autoDamageDealt,
        };
        const healedHp = turn.heal > 0 ? Math.min(s.maxHp, hp + turn.heal) : hp;
        if (!settleBattle(turn.state, { hp: healedHp, stats })) {
          const updated = { ...s, hp: healedHp, battle: turn.state, stats };
          set(updated);
          persist(updated);
        }
        return;
      }

      const updated = { ...s, hp, battle: res.state };
      set(updated);
      persist(updated);
    },

    pickReward: (defId) => {
      const s = get();
      let deck = s.deck;
      let stats = s.stats;
      if (defId) {
        deck = [...s.deck, { uid: nextUid('cd'), defId, upgraded: false }];
        stats = { ...s.stats, cardsAdded: s.stats.cardsAdded + 1 };
      }

      if (s.afterReward === 'victory') {
        const base: RunSlice = { ...s, deck, stats, rewardCards: null, afterReward: null };
        const score = computeScore(base, true);
        const updated: RunSlice = { ...base, status: 'result', score, battle: null };
        set(updated);
        persist(updated);
        return;
      }

      if (s.afterReward === 'perk') {
        const choices = [...perks]
          .filter((p) => !s.perkIds.includes(p.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((p) => p.id);
        const updated: RunSlice = {
          ...s,
          deck,
          stats,
          rewardCards: null,
          afterReward: null,
          battle: null,
          view: 'perk',
          perkChoices: choices,
        };
        set(updated);
        persist(updated);
        return;
      }

      const updated: RunSlice = {
        ...s,
        deck,
        stats,
        rewardCards: null,
        afterReward: null,
        battle: null,
        view: 'map',
      };
      set(updated);
      persist(updated);
    },

    chooseEventOption: (index) => {
      const s = get();
      const ev = runEvents.find((e) => e.id === s.eventId);
      if (!ev) return;
      const choice = ev.choices[index];
      if (!choice) return;
      const eff = choice.effect;

      let updated: RunSlice = { ...s };
      const lines: string[] = [];

      if (eff.damage) {
        updated = { ...updated, hp: Math.max(1, updated.hp - eff.damage) };
        lines.push(`メンタルが ${eff.damage} 削れた。`);
      }
      if (eff.heal) {
        const healed = Math.min(updated.maxHp, updated.hp + eff.heal) - updated.hp;
        updated = { ...updated, hp: updated.hp + healed };
        lines.push(`メンタルが ${healed} 回復した。`);
      }
      if (eff.maxHp) {
        updated = {
          ...updated,
          maxHp: updated.maxHp + eff.maxHp,
          hp: updated.hp + eff.maxHp,
        };
        lines.push(`最大メンタルが ${eff.maxHp} 増えた。`);
      }
      if (eff.addCardRarity) {
        const id = randomCardByRarity(eff.addCardRarity);
        const def = findCard(id);
        updated = {
          ...updated,
          deck: [...updated.deck, { uid: nextUid('cd'), defId: id, upgraded: false }],
          stats: { ...updated.stats, cardsAdded: updated.stats.cardsAdded + 1 },
        };
        lines.push(`「${def?.name}」を習得した。`);
      }
      if (eff.transformRandom) {
        const idx = Math.floor(Math.random() * updated.deck.length);
        const old = updated.deck[idx];
        const oldDef = findCard(old.defId);
        const rarity: CardRarity = oldDef?.rarity === 'N' ? (Math.random() < 0.5 ? 'R' : 'N') : 'SR';
        const newId = randomCardByRarity(rarity);
        const newDef = findCard(newId);
        const deck = updated.deck.map((c, i) =>
          i === idx ? { uid: nextUid('cd'), defId: newId, upgraded: false } : c
        );
        updated = { ...updated, deck };
        lines.push(`「${oldDef?.name}」が「${newDef?.name}」に変わった。`);
      }
      if (eff.rewardCards) {
        const { srLuck } = perkEffects(updated.perkIds);
        updated = {
          ...updated,
          rewardCards: rollRewardCards(false, srLuck),
          afterReward: 'map',
          view: 'reward',
          eventId: null,
        };
        set(updated);
        persist(updated);
        return;
      }
      if (eff.upgradePick || eff.removePick) {
        updated = {
          ...updated,
          picker: eff.upgradePick ? 'upgrade' : 'remove',
        };
        set(updated);
        persist(updated);
        return;
      }

      updated = { ...updated, resultText: lines.join(' ') || 'なにも起こらなかった。' };
      set(updated);
      persist(updated);
    },

    continueFromResult: () => {
      const s = get();
      const updated: RunSlice = {
        ...s,
        view: 'map',
        eventId: null,
        resultText: null,
      };
      set(updated);
      persist(updated);
    },

    restAction: () => {
      const s = get();
      const healed = Math.min(s.maxHp, s.hp + BALANCE.REST_HEAL) - s.hp;
      const updated: RunSlice = {
        ...s,
        hp: s.hp + healed,
        resultText: `深呼吸して、お茶を淹れた。メンタルが ${healed} 回復した。`,
      };
      set(updated);
      persist(updated);
    },

    studyChoose: (mode) => {
      const s = get();
      const updated: RunSlice = { ...s, picker: mode };
      set(updated);
      persist(updated);
    },

    applyPick: (uid) => {
      const s = get();
      if (!s.picker) return;
      const card = s.deck.find((c) => c.uid === uid);
      if (!card) return;
      const def = findCard(card.defId);
      let deck = s.deck;
      let text = '';
      if (s.picker === 'upgrade') {
        deck = s.deck.map((c) => (c.uid === uid ? { ...c, upgraded: true } : c));
        text = `「${def?.name}」を強化した。`;
      } else {
        deck = s.deck.filter((c) => c.uid !== uid);
        text = `「${def?.name}」をデッキから取り除いた。`;
      }
      const updated: RunSlice = { ...s, deck, picker: null, resultText: text };
      set(updated);
      persist(updated);
    },

    cancelPicker: () => {
      const s = get();
      // イベント由来のピッカーを閉じたら、イベント自体を結果テキストで締める
      const updated: RunSlice = {
        ...s,
        picker: null,
        resultText: s.view === 'event' ? '結局、手を付けないことにした。' : s.resultText,
      };
      set(updated);
      persist(updated);
    },

    pickPerk: (perkId) => {
      const s = get();
      const perk = findPerk(perkId);
      if (!perk) return;

      let hp = s.hp + BALANCE.ACT_CLEAR_HEAL;
      let maxHp = s.maxHp;
      if (perk.effect.maxHp) {
        maxHp += perk.effect.maxHp;
        hp += perk.effect.maxHp;
      }
      if (perk.effect.heal) hp += perk.effect.heal;
      if (perk.effect.healToFull) hp = maxHp;
      hp = Math.min(maxHp, hp);

      const nextAct = s.act + 1;
      const updated: RunSlice = {
        ...s,
        hp,
        maxHp,
        perkIds: [...s.perkIds, perkId],
        perkChoices: null,
        act: nextAct,
        map: generateActMap(nextAct),
        positionId: null,
        view: 'map',
      };
      set(updated);
      persist(updated);
    },

    finishDefeat: () => {
      const s = get();
      const score = computeScore(s, false);
      const updated: RunSlice = { ...s, status: 'result', score, battle: null };
      set(updated);
      persist(updated);
    },
  };
});

/** 現在選択可能なノード id 一覧 */
export function selectableNodeIds(map: ActMap | null, positionId: string | null): string[] {
  if (!map) return [];
  if (positionId === null) {
    return map.nodes.filter((n) => n.row === 0).map((n) => n.id);
  }
  const cur = findNode(map, positionId);
  return cur ? cur.next : [];
}

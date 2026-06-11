// QA Quest — バトルエンジン（純関数群）
// store から呼ばれ、BattleState を不変更新で進める。

import { BALANCE } from '@/lib/constants';
import { findCard } from '@/data/cards';
import { findEnemy } from '@/data/enemies';
import type {
  BattleState,
  CardEffects,
  CardInstance,
  EnemyInstance,
  EnemyMove,
  FxEvent,
} from '@/types';

let uidCounter = 0;
export function nextUid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}-${uidCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

/*──────────── ユーティリティ ────────────*/

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** カード実体の効果（強化込み） */
export function resolvedEffects(card: CardInstance): CardEffects {
  const def = findCard(card.defId);
  if (!def) return {};
  return card.upgraded ? { ...def.effects, ...def.upgraded } : def.effects;
}

export function resolvedCost(card: CardInstance): number {
  const def = findCard(card.defId);
  if (!def) return 0;
  if (def.effects.xCost) return -1;
  if (card.upgraded && def.upgradeCost !== undefined) return def.upgradeCost;
  return def.cost;
}

/*──────────── 敵の生成と行動選択 ────────────*/

function pickMove(moves: EnemyMove[], moveIndex: number): EnemyMove {
  return moves[moveIndex % moves.length];
}

export function spawnEnemy(defId: string): EnemyInstance {
  const def = findEnemy(defId);
  if (!def) throw new Error(`unknown enemy: ${defId}`);
  const hp = randInt(def.hpRange[0], def.hpRange[1]);
  return {
    uid: nextUid('en'),
    defId,
    hp,
    maxHp: hp,
    block: 0,
    vulnerable: 0,
    weak: 0,
    strength: 0,
    moveIndex: 0,
    enraged: false,
    nextMove: pickMove(def.moves, 0),
    dead: false,
  };
}

/** 敵の次行動を確定（enrage 切替込み） */
function advanceMove(e: EnemyInstance): EnemyInstance {
  const def = findEnemy(e.defId);
  if (!def) return e;
  const shouldEnrage = !!def.enrageMoves && e.hp <= e.maxHp / 2;
  const enraged = e.enraged || shouldEnrage;
  const moves = enraged && def.enrageMoves ? def.enrageMoves : def.moves;
  const moveIndex = e.enraged === enraged ? e.moveIndex + 1 : 0;
  return { ...e, enraged, moveIndex, nextMove: pickMove(moves, moveIndex) };
}

/*──────────── バトル開始 ────────────*/

export interface BattleSetupOpts {
  deck: CardInstance[];
  enemyIds: string[];
  isElite: boolean;
  isBoss: boolean;
  startBlock: number;
  startFocus: number;
  extraDraw: number;
}

export function createBattle(opts: BattleSetupOpts): BattleState {
  const drawPile = shuffle(opts.deck);
  const state: BattleState = {
    enemies: opts.enemyIds.map(spawnEnemy),
    hand: [],
    drawPile,
    discardPile: [],
    exhaustPile: [],
    energy: BALANCE.ENERGY_PER_TURN,
    maxEnergy: BALANCE.ENERGY_PER_TURN,
    block: opts.startBlock,
    focus: opts.startFocus,
    playerWeak: 0,
    turn: 1,
    phase: 'player',
    enemyCursor: 0,
    powers: { autoDamage: 0, autoDraw: 0, autoBlock: 0 },
    fx: [],
    fxCounter: 0,
    isElite: opts.isElite,
    isBoss: opts.isBoss,
  };
  return drawCards(state, BALANCE.HAND_SIZE + opts.extraDraw);
}

/*──────────── ドロー ────────────*/

export function drawCards(s: BattleState, n: number): BattleState {
  let drawPile = [...s.drawPile];
  let discardPile = [...s.discardPile];
  const hand = [...s.hand];
  for (let i = 0; i < n; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break;
      drawPile = shuffle(discardPile);
      discardPile = [];
    }
    const card = drawPile.pop();
    if (card) hand.push(card);
  }
  return { ...s, drawPile, discardPile, hand };
}

/*──────────── FX ────────────*/

function pushFx(s: BattleState, fx: Omit<FxEvent, 'id'>[]): BattleState {
  let counter = s.fxCounter;
  const list = [...s.fx];
  for (const f of fx) {
    counter += 1;
    list.push({ ...f, id: counter });
  }
  // 直近のものだけ保持（描画済みは自然に流れる）
  return { ...s, fx: list.slice(-12), fxCounter: counter };
}

/*──────────── ダメージ計算 ────────────*/

export function attackDamage(
  base: number,
  s: Pick<BattleState, 'focus' | 'playerWeak'>,
  target: EnemyInstance
): number {
  let d = base + s.focus;
  if (s.playerWeak > 0) d = Math.floor(d * BALANCE.WEAK_FACTOR);
  if (target.vulnerable > 0) d = Math.floor(d * BALANCE.VULNERABLE_FACTOR);
  return Math.max(0, d);
}

function dealToEnemy(
  e: EnemyInstance,
  amount: number
): { enemy: EnemyInstance; hpLost: number } {
  const fromBlock = Math.min(e.block, amount);
  const hpLost = Math.min(e.hp, amount - fromBlock);
  const hp = e.hp - hpLost;
  return {
    enemy: { ...e, block: e.block - fromBlock, hp, dead: hp <= 0 },
    hpLost,
  };
}

/*──────────── カードプレイ ────────────*/

export interface PlayResult {
  state: BattleState;
  /** プレイ不成立（工数不足など） */
  rejected?: string;
  damageDealt: number;
}

export function playCard(
  s: BattleState,
  handIndex: number,
  targetUid: string | null
): PlayResult {
  if (s.phase !== 'player') return { state: s, rejected: 'not-player-turn', damageDealt: 0 };
  const card = s.hand[handIndex];
  if (!card) return { state: s, rejected: 'no-card', damageDealt: 0 };
  const eff = resolvedEffects(card);
  const cost = resolvedCost(card);
  const actualCost = eff.xCost ? s.energy : cost;
  if (!eff.xCost && cost > s.energy) {
    return { state: s, rejected: 'no-energy', damageDealt: 0 };
  }

  let state: BattleState = { ...s, energy: s.energy - actualCost };
  const fx: Omit<FxEvent, 'id'>[] = [];
  let damageDealt = 0;

  // 手札から取り除く
  const hand = [...state.hand];
  hand.splice(handIndex, 1);
  state = { ...state, hand };

  // 攻撃
  if (eff.damage !== undefined) {
    const xMul = eff.xCost ? actualCost : 1;
    const hits = (eff.hits ?? 1) * xMul;
    const targetMode = eff.target ?? 'single';
    let enemies = [...state.enemies];
    let focusUsed = false;

    for (let h = 0; h < hits; h++) {
      const alive = enemies.filter((e) => !e.dead);
      if (alive.length === 0) break;
      let targets: EnemyInstance[];
      if (targetMode === 'all') {
        targets = alive;
      } else if (targetMode === 'random') {
        targets = [alive[Math.floor(Math.random() * alive.length)]];
      } else {
        const chosen = alive.find((e) => e.uid === targetUid) ?? alive[0];
        targets = [chosen];
      }
      for (const t of targets) {
        const dmg = attackDamage(eff.damage, state, t);
        const res = dealToEnemy(t, dmg);
        damageDealt += res.hpLost;
        enemies = enemies.map((e) => (e.uid === t.uid ? res.enemy : e));
        fx.push({ kind: 'damage', target: t.uid, amount: dmg });
        if (res.enemy.dead) fx.push({ kind: 'death', target: t.uid });
        focusUsed = true;
      }
      // 全体攻撃は hits 概念を 1 回で消費
      if (targetMode === 'all' && !eff.xCost) break;
      if (targetMode === 'all' && eff.xCost && h + 1 >= xMul) break;
    }
    state = { ...state, enemies };
    if (focusUsed && state.focus > 0) state = { ...state, focus: 0 };
  }

  // 付与系（特定・萎縮）
  if (eff.vulnerable || eff.weak) {
    const mode = eff.target ?? 'single';
    state = {
      ...state,
      enemies: state.enemies.map((e) => {
        if (e.dead) return e;
        const isTarget =
          mode === 'all' || e.uid === (targetUid ?? state.enemies.find((x) => !x.dead)?.uid);
        if (!isTarget) return e;
        return {
          ...e,
          vulnerable: e.vulnerable + (eff.vulnerable ?? 0),
          weak: e.weak + (eff.weak ?? 0),
        };
      }),
    };
    if (eff.vulnerable) fx.push({ kind: 'status', target: targetUid ?? 'all', label: '特定' });
    if (eff.weak) fx.push({ kind: 'status', target: 'all', label: '萎縮' });
  }

  // 防御・回復・集中・工数
  if (eff.block) {
    state = { ...state, block: state.block + eff.block };
    fx.push({ kind: 'block', target: 'player', amount: eff.block });
  }
  if (eff.focus) state = { ...state, focus: state.focus + eff.focus };
  if (eff.energyGain) state = { ...state, energy: state.energy + eff.energyGain };

  // パワー
  if (eff.autoDamage || eff.autoDraw || eff.autoBlock) {
    state = {
      ...state,
      powers: {
        autoDamage: state.powers.autoDamage + (eff.autoDamage ?? 0),
        autoDraw: state.powers.autoDraw + (eff.autoDraw ?? 0),
        autoBlock: state.powers.autoBlock + (eff.autoBlock ?? 0),
      },
    };
  }

  // ドロー
  if (eff.draw) state = drawCards(state, eff.draw);

  // 捨て札 or 消滅（パワーは場に残る＝消滅扱い）
  const def = findCard(card.defId);
  if (eff.exhaust || def?.type === 'power') {
    state = { ...state, exhaustPile: [...state.exhaustPile, card] };
  } else {
    state = { ...state, discardPile: [...state.discardPile, card] };
  }

  state = pushFx(state, fx);

  // 勝利判定
  if (state.enemies.every((e) => e.dead)) {
    state = { ...state, phase: 'won' };
  }
  return { state, damageDealt };
}

/*──────────── ターン終了 → 敵ターン ────────────*/

export function endPlayerTurn(s: BattleState): BattleState {
  if (s.phase !== 'player') return s;
  // 手札を捨てる
  return {
    ...s,
    hand: [],
    discardPile: [...s.discardPile, ...s.hand],
    phase: 'enemy',
    enemyCursor: 0,
  };
}

export interface EnemyStepResult {
  state: BattleState;
  /** まだ行動する敵が残っているか */
  hasNext: boolean;
  hpLost: number;
}

/** 敵 1 体ぶんの行動を解決（UI が間隔を空けて順番に呼ぶ） */
export function stepEnemyTurn(s: BattleState): EnemyStepResult {
  if (s.phase !== 'enemy') return { state: s, hasNext: false, hpLost: 0 };
  // 次の生存敵を探す
  let cursor = s.enemyCursor;
  while (cursor < s.enemies.length && s.enemies[cursor].dead) cursor++;
  if (cursor >= s.enemies.length) {
    return { state: { ...s, enemyCursor: cursor }, hasNext: false, hpLost: 0 };
  }

  const actor = s.enemies[cursor];
  const move = actor.nextMove;
  let state: BattleState = s;
  const fx: Omit<FxEvent, 'id'>[] = [];
  let hpLost = 0;

  fx.push({ kind: 'enemyAttack', target: actor.uid, label: move.label });

  // 攻撃
  if (move.damage !== undefined) {
    const hits = move.hits ?? 1;
    for (let h = 0; h < hits; h++) {
      let dmg = move.damage + actor.strength;
      if (actor.weak > 0) dmg = Math.floor(dmg * BALANCE.WEAK_FACTOR);
      const fromBlock = Math.min(state.block, dmg);
      const toHp = dmg - fromBlock;
      hpLost += toHp;
      state = { ...state, block: state.block - fromBlock };
      fx.push({ kind: 'damage', target: 'player', amount: dmg });
    }
  }

  // ブロック・バフ・デバフ
  let enemies = state.enemies.map((e) => {
    if (e.uid !== actor.uid) {
      if (move.strengthAll && move.strength && !e.dead) {
        return { ...e, strength: e.strength + move.strength };
      }
      return e;
    }
    let next = e;
    if (move.block) next = { ...next, block: next.block + move.block };
    if (move.strength && !move.strengthAll) {
      next = { ...next, strength: next.strength + move.strength };
    }
    if (move.strength && move.strengthAll) {
      next = { ...next, strength: next.strength + move.strength };
    }
    return next;
  });
  if (move.strength) {
    fx.push({ kind: 'status', target: actor.uid, label: `増強+${move.strength}` });
  }

  let playerWeak = state.playerWeak;
  if (move.weakPlayer) {
    playerWeak += move.weakPlayer;
    fx.push({ kind: 'status', target: 'player', label: '萎縮' });
  }

  // 行動を進める
  enemies = enemies.map((e) => (e.uid === actor.uid ? advanceMove(e) : e));

  state = pushFx({ ...state, enemies, playerWeak, enemyCursor: cursor + 1 }, fx);

  // 次の生存敵がいるか
  let nc = cursor + 1;
  while (nc < state.enemies.length && state.enemies[nc].dead) nc++;
  return { state, hasNext: nc < state.enemies.length, hpLost };
}

/*──────────── 新ターン開始 ────────────*/

export interface TurnStartResult {
  state: BattleState;
  autoDamageDealt: number;
}

export function beginPlayerTurn(s: BattleState, extraDraw: number): TurnStartResult {
  let state: BattleState = {
    ...s,
    phase: 'player',
    turn: s.turn + 1,
    energy: s.maxEnergy,
    block: s.powers.autoBlock, // ブロックはリセット → パワーぶん付与
    playerWeak: Math.max(0, s.playerWeak - 1),
    enemyCursor: 0,
    enemies: s.enemies.map((e) =>
      e.dead
        ? e
        : {
            ...e,
            block: 0,
            vulnerable: Math.max(0, e.vulnerable - 1),
            weak: Math.max(0, e.weak - 1),
          }
    ),
  };

  const fx: Omit<FxEvent, 'id'>[] = [];
  let autoDamageDealt = 0;

  // 自動化スイート：全体ダメージ
  if (state.powers.autoDamage > 0) {
    let enemies = [...state.enemies];
    for (const e of enemies.filter((x) => !x.dead)) {
      const dmg = e.vulnerable > 0
        ? Math.floor(state.powers.autoDamage * BALANCE.VULNERABLE_FACTOR)
        : state.powers.autoDamage;
      const res = dealToEnemy(e, dmg);
      autoDamageDealt += res.hpLost;
      enemies = enemies.map((x) => (x.uid === e.uid ? res.enemy : x));
      fx.push({ kind: 'damage', target: e.uid, amount: dmg });
      if (res.enemy.dead) fx.push({ kind: 'death', target: e.uid });
    }
    state = { ...state, enemies };
  }
  if (state.powers.autoBlock > 0) {
    fx.push({ kind: 'block', target: 'player', amount: state.powers.autoBlock });
  }

  state = drawCards(state, BALANCE.HAND_SIZE + state.powers.autoDraw + extraDraw);
  state = pushFx(state, fx);

  if (state.enemies.every((e) => e.dead)) {
    state = { ...state, phase: 'won' };
  }
  return { state, autoDamageDealt };
}

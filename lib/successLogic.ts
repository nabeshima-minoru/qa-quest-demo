// Success Mode のコアロジック（純粋関数中心）

import { BALANCE } from '@/lib/constants';
import { findWeapon, normalWeapons, poolByCategory, RARITY_WEIGHTS } from '@/data/weapons';
import { weekEvents } from '@/data/weekEvents';
import type {
  BattleResult,
  OwnedWeapon,
  RoleId,
  ScoreResult,
  Stats,
  StatKey,
  TrainingCommand,
  Weapon,
  WeaponRarity,
  WeekEvent,
} from '@/types';

const STAT_KEYS: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];

export function clampStat(v: number): number {
  return Math.max(0, Math.min(BALANCE.STAT_CAP, Math.round(v)));
}

export function statSum(stats: Stats): number {
  return STAT_KEYS.reduce((s, k) => s + stats[k], 0);
}

/** 週 → 章（1..3） */
export function chapterOfWeek(week: number): number {
  return Math.min(3, Math.ceil(week / BALANCE.CHAPTER_WEEKS));
}

export function isBossWeek(week: number): boolean {
  return (BALANCE.BOSS_WEEKS as readonly number[]).includes(week);
}

/** 所持武器のパッシブを加味した実効ステータス */
export function effectiveStats(base: Stats, owned: OwnedWeapon[]): Stats {
  const eff: Stats = { ...base };
  for (const ow of owned) {
    const w = findWeapon(ow.id);
    if (!w) continue;
    const mul = 1 + (ow.level - 1) * BALANCE.WEAPON_PASSIVE_PER_LEVEL;
    for (const k of STAT_KEYS) {
      const v = w.passive[k];
      if (v) eff[k] += v * mul;
    }
  }
  for (const k of STAT_KEYS) eff[k] = clampStat(eff[k]);
  return eff;
}

/** 所持武器による合計パッシブ補正（表示用） */
export function passiveBonus(owned: OwnedWeapon[]): Stats {
  const bonus: Stats = { tech: 0, comm: 0, analysis: 0, mgmt: 0, ai: 0 };
  for (const ow of owned) {
    const w = findWeapon(ow.id);
    if (!w) continue;
    const mul = 1 + (ow.level - 1) * BALANCE.WEAPON_PASSIVE_PER_LEVEL;
    for (const k of STAT_KEYS) {
      const v = w.passive[k];
      if (v) bonus[k] += Math.round(v * mul);
    }
  }
  return bonus;
}

export function determineRole(stats: Stats): RoleId {
  const sum = statSum(stats);
  const desc = [...BALANCE.ROLES].reverse();
  for (const r of desc) {
    if (sum >= r.minStatSum && (!r.cond || r.cond(stats))) return r.id;
  }
  return 'tester';
}

/*──────────────────────────────────────
  武器ドロップ抽選
──────────────────────────────────────*/
function pickRarity(): WeaponRarity {
  const entries = Object.entries(RARITY_WEIGHTS) as [WeaponRarity, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [rarity, w] of entries) {
    r -= w;
    if (r <= 0) return rarity;
  }
  return 'N';
}

export function rollWeaponDrop(
  training: TrainingCommand,
  ownedIds: string[] = []
): string | null {
  if (training.dropChance <= 0) return null;
  if (Math.random() >= training.dropChance) return null;
  const pool = poolByCategory(training.weaponCategories);
  if (pool.length === 0) return null;

  // 未所持の武器を優先（新種を増やす）。所持済みしか残っていなければ重複＝レベルアップ。
  const owned = new Set(ownedIds);
  const unowned = pool.filter((w) => !owned.has(w.id));
  const basePool = unowned.length > 0 ? unowned : pool;

  const rarity = pickRarity();
  let candidates = basePool.filter((w) => w.rarity === rarity);
  if (candidates.length === 0) candidates = basePool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked?.id ?? null;
}

/*──────────────────────────────────────
  訓練の解決（ステータス増減・体力・ドロップ）
──────────────────────────────────────*/
export interface TrainingResolution {
  statDelta: Partial<Stats>;
  staminaDelta: number;
  slump: boolean;
  gainedWeaponId: string | null;
}

function vary(base: number): number {
  const f = 1 + (Math.random() * 2 - 1) * BALANCE.GAIN_VARIANCE;
  return base * f;
}

export function resolveTraining(
  training: TrainingCommand,
  currentStamina: number,
  ownedIds: string[] = []
): TrainingResolution {
  const isWork = training.staminaCost > 0;
  const slump = isWork && currentStamina < BALANCE.LOW_STAMINA;
  const gainFactor = slump ? BALANCE.SLUMP_GAIN_FACTOR : 1;

  const statDelta: Partial<Stats> = {};
  for (const k of STAT_KEYS) {
    const base = training.gains[k];
    if (base) {
      const d = Math.round(vary(base) * gainFactor);
      if (d !== 0) statDelta[k] = d;
    }
  }

  // 体力：cost マイナス（休養）なら回復、プラスなら消費。不調なら追加消費。
  let staminaDelta = -training.staminaCost;
  if (slump) staminaDelta -= 6;

  const gainedWeaponId = rollWeaponDrop(training, ownedIds);

  return { statDelta, staminaDelta, slump, gainedWeaponId };
}

/*──────────────────────────────────────
  週イベント抽選
──────────────────────────────────────*/
export function rollWeekEvent(): WeekEvent | null {
  if (Math.random() >= BALANCE.WEEK_EVENT_CHANCE) return null;
  const total = weekEvents.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of weekEvents) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return weekEvents[weekEvents.length - 1] ?? null;
}

/*──────────────────────────────────────
  武器付与（重複ならレベルアップ）
──────────────────────────────────────*/
export function grantWeapon(
  owned: OwnedWeapon[],
  weaponId: string
): { owned: OwnedWeapon[]; levelUp: boolean } {
  const idx = owned.findIndex((o) => o.id === weaponId);
  if (idx === -1) {
    return { owned: [...owned, { id: weaponId, level: 1 }], levelUp: false };
  }
  const cur = owned[idx];
  if (cur.level >= BALANCE.WEAPON_MAX_LEVEL) {
    return { owned, levelUp: false };
  }
  const next = owned.map((o, i) => (i === idx ? { ...o, level: o.level + 1 } : o));
  return { owned: next, levelUp: true };
}

/*──────────────────────────────────────
  バトル：武器ダメージ計算
──────────────────────────────────────*/
export function weaponBattlePower(
  weapon: Weapon,
  level: number,
  effStats: Stats
): number {
  const lvMul = 1 + (level - 1) * BALANCE.WEAPON_POWER_PER_LEVEL;
  return weapon.power * lvMul + effStats[weapon.scaleStat] * BALANCE.BATTLE_STAT_SCALE;
}

export interface AttackResult {
  matched: boolean;
  damageDealt: number;
  mentalTaken: number;
}

export function computeAttack(
  weapon: Weapon,
  level: number,
  effStats: Stats,
  demandCategory: Weapon['category'],
  demandMentalDamage: number
): AttackResult {
  const matched = weapon.category === demandCategory;
  const base = weaponBattlePower(weapon, level, effStats);
  const damageDealt = Math.round(base * (matched ? BALANCE.AFFINITY_BONUS : 1));
  const factor = matched ? BALANCE.MATCH_MENTAL_FACTOR : BALANCE.MISS_MENTAL_FACTOR;
  const mentalTaken = Math.round(demandMentalDamage * factor);
  return { matched, damageDealt, mentalTaken };
}

/*──────────────────────────────────────
  最終スコア
──────────────────────────────────────*/
export function calcFinalScore(input: {
  stats: Stats;
  owned: OwnedWeapon[];
  battles: BattleResult[];
  role: RoleId;
}): ScoreResult {
  const sum = statSum(input.stats);
  const growthScore = Math.min(100, (sum / 420) * 100);

  // バトル：勝利数 70% + 残メンタル率 30%
  const wins = input.battles.filter((b) => b.result === 'win').length;
  const winScore = (wins / 3) * 70;
  const mentalRatios = input.battles
    .filter((b) => b.result === 'win')
    .map((b) => b.remainingMental / b.playerMaxMental);
  const avgMental =
    mentalRatios.length > 0
      ? mentalRatios.reduce((s, v) => s + v, 0) / mentalRatios.length
      : 0;
  const battleScore = Math.min(100, winScore + avgMental * 30);

  // コレクション：レア度ポイント（N1/R2/SR3）
  const rarityPoint: Record<WeaponRarity, number> = { N: 1, R: 2, SR: 3 };
  const collPoints = input.owned.reduce((s, o) => {
    const w = findWeapon(o.id);
    return s + (w ? rarityPoint[w.rarity] : 0);
  }, 0);
  const collectionScore = Math.min(100, (collPoints / 28) * 100);

  const roleDef = BALANCE.ROLES.find((r) => r.id === input.role);
  const roleScore = roleDef?.score ?? 30;

  const w = BALANCE.SCORE_WEIGHTS;
  const finalScore =
    growthScore * w.growth +
    battleScore * w.battle +
    collectionScore * w.collection +
    roleScore * w.role;

  const t = BALANCE.RANK_THRESHOLDS;
  const rank: ScoreResult['rank'] =
    finalScore >= t.S
      ? 'S'
      : finalScore >= t.A
        ? 'A'
        : finalScore >= t.B
          ? 'B'
          : finalScore >= t.C
            ? 'C'
            : 'D';

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    rank,
    breakdown: {
      growthScore: Math.round(growthScore * 10) / 10,
      battleScore: Math.round(battleScore * 10) / 10,
      collectionScore: Math.round(collectionScore * 10) / 10,
      roleScore,
    },
  };
}

export function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** トロフィー以外の通常武器総数（コレクション率表示用） */
export const TOTAL_NORMAL_WEAPONS = normalWeapons.length;

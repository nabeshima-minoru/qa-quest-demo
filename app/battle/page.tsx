'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/common/BaseButton';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import BossPortrait from '@/components/boss/BossPortrait';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import WeaponCard from '@/components/game/WeaponCard';
import { useGameStore } from '@/lib/gameStore';
import { computeAttack, effectiveStats } from '@/lib/successLogic';
import { findBossById } from '@/data/successBosses';
import { findWeapon, TROPHY_BY_CHAPTER } from '@/data/weapons';

const BATTLE_TURN_CAP = 16;

export default function BattlePage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const status = useGameStore((s) => s.status);
  const battle = useGameStore((s) => s.battle);
  const stats = useGameStore((s) => s.stats);
  const weapons = useGameStore((s) => s.weapons);
  const currentRole = useGameStore((s) => s.currentRole);
  const pendingRecap = useGameStore((s) => s.pendingRecap);
  const submitWeaponAttack = useGameStore((s) => s.submitWeaponAttack);
  const advanceBattle = useGameStore((s) => s.advanceBattle);
  const finishBattle = useGameStore((s) => s.finishBattle);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  // バトルが無い状況の整理
  useEffect(() => {
    if (!ready) return;
    if (battle) return;
    if (pendingRecap !== null) {
      router.replace('/recap');
    } else if (status === 'idle') {
      router.replace('/');
    } else {
      router.replace('/game');
    }
  }, [ready, battle, status, pendingRecap, router]);

  if (!battle) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">読み込み中…</p>
      </main>
    );
  }

  const boss = findBossById(battle.bossId);
  if (!boss) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">ボス情報が見つかりません。</p>
      </main>
    );
  }

  const demand = boss.demands[battle.demandIndex % boss.demands.length];
  const eff = effectiveStats(stats, weapons);
  const hpRatio = battle.bossMaxHp > 0 ? battle.bossHp / battle.bossMaxHp : 0;
  const mentalRatio =
    battle.playerMaxMental > 0 ? battle.playerMental / battle.playerMaxMental : 0;
  const mentalColor =
    mentalRatio < 0.3 ? 'var(--danger)' : mentalRatio < 0.6 ? 'var(--warn)' : 'var(--success)';

  const pending = battle.pending;
  const result = battle.result;
  const recentLog = [...battle.log].slice(-4).reverse();

  return (
    <>
      <main className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <header
          className="qa-act-emphasis mb-5 rounded-[var(--r)] border px-5 py-3 flex items-center justify-between gap-4"
          style={{
            borderColor: boss.themeColor,
            background: `color-mix(in srgb, ${boss.themeColor} 8%, var(--card))`,
          }}
        >
          <div>
            <p
              className="mono text-[10px] tracking-[0.3em] uppercase"
              style={{ color: boss.themeColor }}
            >
              Chapter {boss.chapter} Boss · Week {boss.week}
            </p>
            <h1 className="serif text-xl text-[var(--cream)] leading-tight">
              {boss.title} {boss.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="mono text-[10px] text-[var(--text-3)]">Turn</p>
            <p className="mono text-lg text-[var(--cream)]">
              {battle.turn}
              <span className="text-[var(--text-3)] text-xs"> / {BATTLE_TURN_CAP}</span>
            </p>
          </div>
        </header>

        {/* Boss stage */}
        <section
          className="rounded-[var(--r)] border p-5 mb-5"
          style={{
            borderColor: boss.themeColor,
            background: `color-mix(in srgb, ${boss.themeColor} 6%, var(--card))`,
          }}
        >
          <div className="flex flex-col items-center">
            <BossPortrait
              archetype={boss.archetype}
              color={boss.themeColor}
              hpRatio={hpRatio}
              hit={!!pending && pending.damageDealt > 0 && !result}
              defeated={result === 'win'}
              escaped={result === 'lose'}
              size={150}
            />
            {/* Boss HP */}
            <div className="w-full max-w-md mt-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[var(--text-2)]">課題 HP</span>
                <span className="mono text-[var(--text-2)]">
                  {battle.bossHp} / {battle.bossMaxHp}
                </span>
              </div>
              <BaseProgressBar
                value={battle.bossHp}
                max={battle.bossMaxHp}
                height={10}
                color={boss.themeColor}
              />
            </div>
          </div>

          {/* Demand bubble */}
          {!result && (
            <div className="mt-4 rounded-[var(--r-sm)] bg-[var(--card)] border border-[var(--edge2)] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="mono text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest"
                  style={{ color: boss.themeColor, border: `1px solid ${boss.themeColor}` }}
                >
                  Demand
                </span>
                <span className="mono text-[10px] text-[var(--text-3)]">
                  失敗時メンタル -{demand.mentalDamage}
                </span>
              </div>
              <p className="text-[13px] text-[var(--cream)] leading-relaxed whitespace-pre-line">
                {demand.text}
              </p>
            </div>
          )}
        </section>

        {/* Player mental */}
        <section className="rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-4 mb-5">
          <div className="flex items-center gap-3">
            <PlayerAvatar role={currentRole} size={48} />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[var(--text-2)]">メンタル</span>
                <span className="mono text-[var(--text-2)]">
                  {battle.playerMental} / {battle.playerMaxMental}
                </span>
              </div>
              <BaseProgressBar
                value={battle.playerMental}
                max={battle.playerMaxMental}
                height={10}
                color={mentalColor}
              />
            </div>
          </div>
        </section>

        {/* Action area */}
        {!result &&
          (pending ? (
            <ActionResultPanel pending={pending} onNext={() => advanceBattle()} />
          ) : (
            <section className="rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="serif text-lg text-[var(--cream)]">武器を選んで切り返す</h2>
                <span className="mono text-[11px] text-[var(--text-2)]">{weapons.length} 種</span>
              </div>
              <p className="text-[12px] text-[var(--text-2)] mb-4">
                求められた領域に合った武器ほど<strong className="text-[var(--accent)]">特効</strong>
                （ダメージ増・被ダメ激減）。予測ダメージを見て切り札を選ぼう。
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {weapons.map((o) => {
                  const w = findWeapon(o.id);
                  if (!w) return null;
                  const atk = computeAttack(
                    w,
                    o.level,
                    eff,
                    demand.weakCategory,
                    demand.mentalDamage
                  );
                  const badge = atk.matched
                    ? `特効 ~${atk.damageDealt}`
                    : `~${atk.damageDealt}`;
                  return (
                    <WeaponCard
                      key={o.id}
                      weaponId={o.id}
                      level={o.level}
                      showPassive={false}
                      badge={badge}
                      onClick={() => submitWeaponAttack(o.id)}
                    />
                  );
                })}
              </div>
            </section>
          ))}

        {/* Battle log */}
        {recentLog.length > 0 && !result && (
          <section className="mt-5 rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-4">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-2">
              Battle Log
            </h3>
            <ul className="space-y-1">
              {recentLog.map((l, i) => (
                <li
                  key={`${l.turn}-${i}`}
                  className="flex items-center justify-between text-[11px] mono text-[var(--text-2)]"
                >
                  <span className="truncate">
                    T{l.turn} {l.weaponName}
                    {l.matched && (
                      <span className="text-[var(--accent)]"> 特効</span>
                    )}
                  </span>
                  <span>
                    <span className="text-[var(--cream)]">-{l.damageDealt}</span>
                    <span className="text-[var(--text-3)]"> / 被 -{l.mentalTaken}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Result overlay */}
      {result && (
        <ResultOverlay
          win={result === 'win'}
          boss={boss}
          chapter={battle.chapter}
          turnsTaken={battle.turn}
          remainingMental={battle.playerMental}
          maxMental={battle.playerMaxMental}
          onFinish={() => {
            finishBattle();
            router.push('/recap');
          }}
        />
      )}
    </>
  );
}

/*──────────────────── Action result panel ────────────────────*/
function ActionResultPanel({
  pending,
  onNext,
}: {
  pending: NonNullable<ReturnType<typeof useGameStore.getState>['battle']>['pending'];
  onNext: () => void;
}) {
  if (!pending) return null;
  return (
    <section
      className={`qa-evt-card rounded-[var(--r)] border p-5 ${
        pending.matched ? 'border-[var(--accent)]' : 'border-[var(--edge2)]'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="mono text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest"
          style={{
            color: pending.matched ? 'var(--accent)' : 'var(--text-3)',
            border: '1px solid currentColor',
          }}
        >
          {pending.matched ? '特効ヒット' : 'ヒット'}
        </span>
        <h3 className="text-[13px] font-medium text-[var(--cream)]">{pending.weaponName}</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="mono text-[12px] px-2 py-1 rounded-sm bg-[var(--card2)] text-[var(--cream)]">
          与ダメージ <span className="text-[var(--accent)] font-bold">{pending.damageDealt}</span>
        </span>
        <span className="mono text-[12px] px-2 py-1 rounded-sm bg-[var(--card2)] text-[var(--text-2)]">
          被メンタル{' '}
          <span style={{ color: pending.mentalTaken > 0 ? 'var(--danger)' : 'var(--success)' }}>
            -{pending.mentalTaken}
          </span>
        </span>
      </div>

      <p className="text-[13px] text-[var(--text-2)] italic leading-relaxed mb-4">
        「{pending.reaction}」
      </p>

      <BaseButton fullWidth size="lg" onClick={onNext}>
        次へ
      </BaseButton>
    </section>
  );
}

/*──────────────────── Result overlay ────────────────────*/
function ResultOverlay({
  win,
  boss,
  chapter,
  turnsTaken,
  remainingMental,
  maxMental,
  onFinish,
}: {
  win: boolean;
  boss: NonNullable<ReturnType<typeof findBossById>>;
  chapter: number;
  turnsTaken: number;
  remainingMental: number;
  maxMental: number;
  onFinish: () => void;
}) {
  const trophyId = win ? TROPHY_BY_CHAPTER[chapter] : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2520]/45 backdrop-blur-sm px-6">
      <div
        className="qa-evt-card bg-[var(--card)] rounded-[var(--r)] px-7 py-8 max-w-md w-full text-center space-y-4 border"
        style={{ borderColor: win ? 'var(--brass)' : boss.themeColor }}
      >
        <p
          className="mono text-[11px] tracking-[0.3em] uppercase"
          style={{ color: win ? 'var(--brass)' : boss.themeColor }}
        >
          {win ? 'Victory' : 'Retreat'}
        </p>
        <div className="flex justify-center">
          <BossPortrait
            archetype={boss.archetype}
            color={boss.themeColor}
            hpRatio={win ? 0 : 0.5}
            defeated={win}
            escaped={!win}
            size={120}
          />
        </div>
        <h2 className="serif text-2xl text-[var(--cream)]">
          {win ? `${boss.name} を説き伏せた！` : `${boss.name} に押し負けた…`}
        </h2>
        <p className="text-[13px] text-[var(--text-2)] leading-relaxed whitespace-pre-line">
          {win ? boss.victory : boss.defeat}
        </p>

        <div className="flex justify-center gap-4 mono text-[11px] text-[var(--text-3)]">
          <span>
            ターン <span className="text-[var(--cream)]">{turnsTaken}</span>
          </span>
          <span>
            残メンタル{' '}
            <span className="text-[var(--cream)]">
              {remainingMental}/{maxMental}
            </span>
          </span>
        </div>

        {trophyId && (
          <div className="pt-1">
            <p className="mono text-[10px] text-[var(--brass)] mb-1.5">章の勲章を獲得！</p>
            <WeaponCard weaponId={trophyId} compact showPassive={false} />
          </div>
        )}

        <BaseButton fullWidth size="lg" onClick={onFinish}>
          章末総括へ
        </BaseButton>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BaseButton from '@/components/common/BaseButton';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import WeaponCard from '@/components/game/WeaponCard';
import BossPortrait from '@/components/boss/BossPortrait';
import { useGameStore } from '@/lib/gameStore';
import { BALANCE, STAT_COLORS, STAT_LABELS } from '@/lib/constants';
import {
  effectiveStats,
  isBossWeek,
  passiveBonus,
  statSum,
} from '@/lib/successLogic';
import { trainings } from '@/data/trainings';
import { findBossByWeek } from '@/data/successBosses';
import type { StatKey } from '@/types';

const STAT_ORDER: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];

const CHAPTER_TITLE: Record<number, string> = {
  1: '現場のいろは',
  2: '信頼を勝ち取れ',
  3: '品質経営への道',
};

export default function GamePage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const status = useGameStore((s) => s.status);
  const week = useGameStore((s) => s.week);
  const chapter = useGameStore((s) => s.chapter);
  const stats = useGameStore((s) => s.stats);
  const stamina = useGameStore((s) => s.stamina);
  const weapons = useGameStore((s) => s.weapons);
  const currentRole = useGameStore((s) => s.currentRole);
  const weekResolution = useGameStore((s) => s.weekResolution);
  const battle = useGameStore((s) => s.battle);
  const pendingRecap = useGameStore((s) => s.pendingRecap);
  const pendingRoleUp = useGameStore((s) => s.pendingRoleUp);
  const doTraining = useGameStore((s) => s.doTraining);
  const resolveWeekEventChoice = useGameStore((s) => s.resolveWeekEventChoice);
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const startBattle = useGameStore((s) => s.startBattle);
  const clearRoleUp = useGameStore((s) => s.clearRoleUp);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 優先度: 章末総括 > 完了 > バトル
  useEffect(() => {
    if (pendingRecap !== null) {
      router.push('/recap');
      return;
    }
    if (status === 'completed') {
      router.push('/score');
      return;
    }
    if (battle) {
      router.push('/battle');
    }
  }, [pendingRecap, status, battle, router]);

  if (status === 'idle') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-[var(--text-2)] text-sm">進行中のセッションがありません。</p>
          <Link href="/route-select">
            <BaseButton>ルート選択へ</BaseButton>
          </Link>
        </div>
      </main>
    );
  }

  const boss = isBossWeek(week) ? findBossByWeek(week) : null;
  const eff = effectiveStats(stats, weapons);
  const bonus = passiveBonus(weapons);
  const weekInChapter = ((week - 1) % BALANCE.CHAPTER_WEEKS) + 1;
  const lowStamina = stamina < BALANCE.LOW_STAMINA;
  const roleName =
    BALANCE.ROLES.find((r) => r.id === currentRole)?.name ?? 'テスター';

  return (
    <>
      <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
        {/* Chapter / Week banner */}
        <header className="qa-act-emphasis mb-5 rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] px-5 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="mono text-[10px] tracking-[0.3em] text-[var(--text-3)] uppercase">
              Chapter {chapter} · Week {weekInChapter}/{BALANCE.CHAPTER_WEEKS}
            </p>
            <h1 className="serif text-xl text-[var(--cream)] leading-tight">
              第{chapter}章「{CHAPTER_TITLE[chapter]}」
            </h1>
          </div>
          <div className="text-right">
            <p className="mono text-[10px] text-[var(--text-3)]">通算</p>
            <p className="mono text-lg text-[var(--cream)]">
              {week}
              <span className="text-[var(--text-3)] text-xs"> / {BALANCE.MAX_WEEKS} 週</span>
            </p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[290px_1fr]">
          {/* ── Left: player panel ── */}
          <aside className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-4">
              <div className="flex items-center gap-3 mb-4">
                <PlayerAvatar role={currentRole} size={64} />
                <div>
                  <p className="mono text-[10px] tracking-widest text-[var(--text-3)] uppercase">
                    Role
                  </p>
                  <p className="serif text-base text-[var(--cream)]">{roleName}</p>
                  <p className="mono text-[10px] text-[var(--text-3)]">
                    総合力 {statSum(stats)}
                  </p>
                </div>
              </div>

              {/* Stamina */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className={lowStamina ? 'text-[var(--warn)]' : 'text-[var(--text-2)]'}>
                    体力 {lowStamina && '（不調注意）'}
                  </span>
                  <span className="mono text-[var(--text-2)]">
                    {stamina} / {BALANCE.MAX_STAMINA}
                  </span>
                </div>
                <BaseProgressBar
                  value={stamina}
                  max={BALANCE.MAX_STAMINA}
                  height={8}
                  color={lowStamina ? 'var(--warn)' : 'var(--success)'}
                />
              </div>

              {/* Stats */}
              <div className="space-y-2.5">
                {STAT_ORDER.map((k) => (
                  <div key={k}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[var(--text-2)]">{STAT_LABELS[k]}</span>
                      <span className="mono text-[var(--text-2)]">
                        {eff[k]}
                        {bonus[k] > 0 && (
                          <span className="text-[var(--brass)]"> (+{bonus[k]})</span>
                        )}
                      </span>
                    </div>
                    <BaseProgressBar
                      value={eff[k]}
                      max={BALANCE.STAT_CAP}
                      height={6}
                      color={STAT_COLORS[k]}
                    />
                  </div>
                ))}
              </div>
            </div>

            <BaseButton
              fullWidth
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm('現在の進行を放棄してタイトルに戻りますか？')) {
                  reset();
                  router.push('/');
                }
              }}
            >
              リセット
            </BaseButton>
          </aside>

          {/* ── Center: action area ── */}
          <section className="space-y-5">
            {boss ? (
              <BossEncounter
                bossName={boss.name}
                bossTitle={boss.title}
                archetype={boss.archetype}
                color={boss.themeColor}
                intro={boss.intro}
                onStart={() => startBattle()}
              />
            ) : weekResolution ? (
              <WeekResultPanel
                onChoice={resolveWeekEventChoice}
                onNext={() => advanceWeek()}
              />
            ) : (
              <TrainingArea onTrain={doTraining} lowStamina={lowStamina} />
            )}

            {/* Weapon collection */}
            <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)]">
                  所持武器 · Arsenal
                </h3>
                <span className="mono text-[11px] text-[var(--text-2)]">
                  {weapons.length} 種
                </span>
              </div>
              {weapons.length === 0 ? (
                <p className="text-[12px] text-[var(--text-3)]">
                  まだ武器がありません。訓練で集めましょう。
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {weapons.map((w) => (
                    <WeaponCard key={w.id} weaponId={w.id} level={w.level} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Role-up modal */}
      {pendingRoleUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2520]/40 backdrop-blur-sm px-6"
          onClick={clearRoleUp}
        >
          <div
            className="bg-[var(--card)] border border-[var(--brass)] rounded-[var(--r)] px-8 py-10 max-w-md w-full text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mono text-[11px] tracking-[0.3em] text-[var(--brass)] uppercase">
              Promotion
            </p>
            <h2 className="serif text-2xl text-[var(--cream)]">ロール昇格！</h2>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex flex-col items-center gap-2 opacity-70">
                <PlayerAvatar role={pendingRoleUp.from} size={72} />
                <p className="mono text-[11px] text-[var(--text-2)]">
                  {BALANCE.ROLES.find((r) => r.id === pendingRoleUp.from)?.name}
                </p>
              </div>
              <span className="serif text-2xl text-[var(--brass)]">→</span>
              <div className="flex flex-col items-center gap-2">
                <PlayerAvatar role={pendingRoleUp.to} size={88} />
                <p className="serif text-base text-[var(--brass)]">
                  {BALANCE.ROLES.find((r) => r.id === pendingRoleUp.to)?.name}
                </p>
              </div>
            </div>
            <BaseButton onClick={clearRoleUp} size="md">
              閉じる
            </BaseButton>
          </div>
        </div>
      )}
    </>
  );
}

/*──────────────────── Training area ────────────────────*/
function TrainingArea({
  onTrain,
  lowStamina,
}: {
  onTrain: (id: string) => void;
  lowStamina: boolean;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5">
      <h2 className="serif text-lg text-[var(--cream)] mb-1">今週の過ごし方を選ぶ</h2>
      <p className="text-[12px] text-[var(--text-2)] mb-4">
        訓練で能力を伸ばし、武器（知識・技術・人脈）を集めよう。
        {lowStamina && (
          <span className="text-[var(--warn)]">
            {' '}体力が低い。今は不調になりやすい——休養も検討を。
          </span>
        )}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {trainings.map((t) => {
          const isRest = t.theme === 'rest';
          const gainSummary = Object.entries(t.gains)
            .map(([k, v]) => `${STAT_LABELS[k as StatKey]}+${v}`)
            .join(' / ');
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTrain(t.id)}
              className="text-left rounded-[var(--r-sm)] border border-[var(--edge2)] bg-[var(--card)] hover:border-[var(--text-3)] hover:bg-[var(--card2)] transition-all duration-150 p-4"
              style={{ borderLeftWidth: 3, borderLeftColor: t.accent }}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span
                  className="grid place-items-center rounded-[var(--r-sm)] serif font-bold"
                  style={{
                    width: 36,
                    height: 36,
                    background: `color-mix(in srgb, ${t.accent} 16%, var(--card))`,
                    color: t.accent,
                    border: `1px solid color-mix(in srgb, ${t.accent} 40%, transparent)`,
                  }}
                >
                  {t.glyph}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-[var(--cream)] leading-tight">
                    {t.name}
                  </p>
                  <p className="mono text-[10px] text-[var(--text-3)]">
                    {isRest ? `体力+${-t.staminaCost}` : `体力-${t.staminaCost}`}
                    {t.dropChance > 0 &&
                      ` · 武器 ${Math.round(t.dropChance * 100)}%`}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                {t.description}
              </p>
              {gainSummary && (
                <p className="mono text-[10px] text-[var(--success)] mt-1.5">{gainSummary}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/*──────────────────── Week result panel ────────────────────*/
function WeekResultPanel({
  onChoice,
  onNext,
}: {
  onChoice: (key: 'A' | 'B') => void;
  onNext: () => void;
}) {
  const wr = useGameStore((s) => s.weekResolution);
  if (!wr) return null;

  const statEntries = Object.entries(wr.statDelta) as [StatKey, number][];
  const ev = wr.event;

  return (
    <div className="qa-evt-card bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="serif text-lg text-[var(--cream)]">第{wr.week}週 の結果</h2>
        <span className="mono text-[10px] text-[var(--text-3)] uppercase tracking-widest">
          {wr.trainingName}
        </span>
      </div>

      {/* training outcome */}
      <div className="rounded-[var(--r-sm)] bg-[var(--card2)] p-3 space-y-2">
        {wr.slump && (
          <p className="text-[12px] text-[var(--warn)]">
            体力不足で不調…成長が伸び悩んだ。
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {statEntries.length > 0 ? (
            statEntries.map(([k, v]) => (
              <span
                key={k}
                className="mono text-[11px] px-2 py-0.5 rounded-sm"
                style={{
                  background: 'var(--card)',
                  color: v >= 0 ? 'var(--success)' : 'var(--danger)',
                  border: '1px solid var(--edge2)',
                }}
              >
                {STAT_LABELS[k]} {v >= 0 ? '+' : ''}
                {v}
              </span>
            ))
          ) : (
            <span className="mono text-[11px] text-[var(--text-3)]">能力変化なし</span>
          )}
          <span
            className="mono text-[11px] px-2 py-0.5 rounded-sm"
            style={{
              background: 'var(--card)',
              color: wr.staminaDelta >= 0 ? 'var(--success)' : 'var(--text-2)',
              border: '1px solid var(--edge2)',
            }}
          >
            体力 {wr.staminaDelta >= 0 ? '+' : ''}
            {wr.staminaDelta}
          </span>
        </div>

        {wr.gainedWeaponId && (
          <div className="pt-1">
            <p className="mono text-[10px] text-[var(--brass)] mb-1">
              {wr.weaponLevelUp ? '武器がレベルアップ！' : '武器を入手！'}
            </p>
            <WeaponCard weaponId={wr.gainedWeaponId} compact showPassive={false} />
          </div>
        )}
      </div>

      {/* random event */}
      {ev && (
        <div
          className={`rounded-[var(--r-sm)] p-3 border ${
            ev.tone === 'bad'
              ? 'border-[var(--danger)] qa-evt-trouble'
              : ev.tone === 'fortune'
                ? 'border-[var(--brass)] qa-evt-rare'
                : 'border-[var(--edge2)]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="mono text-[9px] px-1.5 py-0.5 rounded-sm uppercase"
              style={{
                color:
                  ev.tone === 'bad'
                    ? 'var(--danger)'
                    : ev.tone === 'good'
                      ? 'var(--success)'
                      : ev.tone === 'fortune'
                        ? 'var(--brass)'
                        : 'var(--info)',
                border: '1px solid currentColor',
              }}
            >
              {ev.tone === 'bad'
                ? 'Trouble'
                : ev.tone === 'good'
                  ? 'Good'
                  : ev.tone === 'fortune'
                    ? 'Fortune'
                    : 'Choice'}
            </span>
            <h3 className="text-[13px] font-medium text-[var(--cream)]">{ev.title}</h3>
          </div>
          <p className="text-[12px] text-[var(--text-2)] leading-relaxed">{ev.description}</p>

          {/* choice event */}
          {wr.eventPending && ev.choices ? (
            <div className="mt-3 grid gap-2">
              {ev.choices.map((c) => (
                <BaseButton
                  key={c.key}
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => onChoice(c.key)}
                >
                  {c.label}
                </BaseButton>
              ))}
            </div>
          ) : (
            wr.eventResult && (
              <p className="mt-2 text-[12px] text-[var(--cream)]">{wr.eventResult.message}</p>
            )
          )}
        </div>
      )}

      <BaseButton fullWidth size="lg" onClick={onNext} disabled={wr.eventPending}>
        {wr.eventPending ? '選択してください' : '次の週へ進む'}
      </BaseButton>
    </div>
  );
}

/*──────────────────── Boss encounter CTA ────────────────────*/
function BossEncounter({
  bossName,
  bossTitle,
  archetype,
  color,
  intro,
  onStart,
}: {
  bossName: string;
  bossTitle: string;
  archetype: React.ComponentProps<typeof BossPortrait>['archetype'];
  color: string;
  intro: string;
  onStart: () => void;
}) {
  return (
    <div
      className="qa-evt-card rounded-[var(--r)] border p-6 text-center"
      style={{ borderColor: color, background: `color-mix(in srgb, ${color} 7%, var(--card))` }}
    >
      <p className="mono text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color }}>
        Chapter Boss
      </p>
      <div className="flex justify-center my-3">
        <BossPortrait archetype={archetype} color={color} hpRatio={1} size={150} />
      </div>
      <h2 className="serif text-2xl text-[var(--cream)]">{bossName}</h2>
      <p className="mono text-[11px] text-[var(--text-3)] mb-3">{bossTitle}</p>
      <p className="text-[13px] text-[var(--text-2)] leading-relaxed whitespace-pre-line max-w-md mx-auto mb-5">
        {intro}
      </p>
      <BaseButton size="lg" onClick={onStart}>
        武器を携えて決戦に挑む
      </BaseButton>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/common/BaseButton';
import BossPortrait from '@/components/boss/BossPortrait';
import { findBossById } from '@/data/bosses';
import { useGameStore } from '@/lib/gameStore';
import type { BossChoice } from '@/types';

const QUALITY_LABEL: Record<BossChoice['quality'], string> = {
  optimal: '最適解',
  good: '良判断',
  average: '平均',
  poor: '悪手',
};

const QUALITY_COLOR: Record<BossChoice['quality'], string> = {
  optimal: 'var(--brass)',
  good: 'var(--success)',
  average: 'var(--text-2)',
  poor: 'var(--danger)',
};

export default function BossPage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const battle = useGameStore((s) => s.bossBattle);
  const submitBossChoice = useGameStore((s) => s.submitBossChoice);
  const advanceBossPhase = useGameStore((s) => s.advanceBossPhase);
  const finishBoss = useGameStore((s) => s.finishBoss);
  const status = useGameStore((s) => s.status);

  const [selected, setSelected] = useState<BossChoice['key'] | null>(null);
  const [hitFlash, setHitFlash] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // バトルが無い時は /game へ戻す
  useEffect(() => {
    if (status === 'idle') {
      router.replace('/');
      return;
    }
    if (!battle) {
      router.replace('/game');
    }
  }, [battle, status, router]);

  // pending（リアクション表示）になったタイミングで hit クラスを一瞬付与
  useEffect(() => {
    if (battle?.pending && battle.pending.damage > 0) {
      setHitFlash(true);
      const t = setTimeout(() => setHitFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [battle?.pending]);

  // phase 変更時に選択をリセット
  useEffect(() => {
    setSelected(null);
  }, [battle?.phase]);

  const boss = useMemo(() => (battle ? findBossById(battle.bossId) : null), [battle]);
  const phaseData = useMemo(
    () => (boss && battle ? boss.phases[battle.phase - 1] : null),
    [boss, battle]
  );

  if (!battle || !boss || !phaseData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">読み込み中...</p>
      </main>
    );
  }

  const hpRatio = battle.hp / battle.maxHp;
  const themed = boss.themeColor;

  // 結果確定済み（撃破 or 撤退）画面
  if (battle.result) {
    const defeated = battle.result === 'defeated';
    return (
      <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
        <div
          className="bg-[var(--card)] border rounded-[var(--r)] p-8 text-center space-y-6"
          style={{ borderColor: themed }}
        >
          <p
            className="mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: themed }}
          >
            {defeated ? 'Victory' : 'Retreat'}
          </p>
          <h2 className="serif text-3xl text-[var(--cream)]">
            {defeated ? `${boss.name} を撃破！` : `${boss.name} は去っていった`}
          </h2>

          <div className="flex justify-center">
            <BossPortrait
              archetype={boss.archetype}
              color={themed}
              hpRatio={defeated ? 0 : hpRatio}
              defeated={defeated}
              escaped={!defeated}
              size={200}
            />
          </div>

          <blockquote
            className="serif italic text-[14px] text-[var(--text)] border-l-2 pl-4 mx-auto max-w-md text-left"
            style={{ borderColor: themed }}
          >
            「{defeated ? boss.victory : boss.escape}」
          </blockquote>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
            <RewardTile
              label="獲得 EXP"
              value={`+${defeated ? 250 : 60}`}
              color="var(--brass)"
            />
            <RewardTile
              label="獲得資金"
              value={`+¥${defeated ? '30,000' : '0'}`}
              color={defeated ? 'var(--success)' : 'var(--text-3)'}
            />
          </div>

          <BaseButton
            size="lg"
            onClick={() => {
              finishBoss();
              router.push('/recap');
            }}
          >
            総括へ進む
          </BaseButton>
        </div>
      </main>
    );
  }

  // 通常戦闘画面
  return (
    <main className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-1 mb-4">
        <p
          className="mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: themed }}
        >
          Boss Battle · Phase {battle.phase} / 3
        </p>
        <h1 className="serif text-xl text-[var(--cream)]">
          無理難題に立ち向かえ
        </h1>
      </header>

      {/* Boss panel */}
      <section
        className="border rounded-[var(--r)] p-5 mb-5"
        style={{
          background: `linear-gradient(180deg, ${themed}15 0%, var(--card) 60%)`,
          borderColor: themed,
        }}
      >
        <div className="flex items-start gap-4">
          <BossPortrait
            archetype={boss.archetype}
            color={themed}
            hpRatio={hpRatio}
            hit={hitFlash}
            size={140}
          />
          <div className="flex-1 min-w-0">
            <p
              className="mono text-[10px] uppercase tracking-widest"
              style={{ color: themed }}
            >
              {boss.title}
            </p>
            <h2 className="serif text-2xl text-[var(--cream)] mb-2">
              {boss.name}
            </h2>
            <HpBar hp={battle.hp} max={battle.maxHp} color={themed} />
            <p
              className="mono text-[10px] text-[var(--text-3)] mt-1 text-right"
            >
              HP {battle.hp} / {battle.maxHp}
            </p>
          </div>
        </div>
      </section>

      {/* Demand bubble */}
      <section
        className="relative bg-[var(--card2)] border border-[var(--edge2)] rounded-[var(--r)] p-5 mb-5"
      >
        <span
          className="absolute -top-2 left-6 w-3 h-3 rotate-45"
          style={{ background: 'var(--card2)', borderTop: '1px solid var(--edge2)', borderLeft: '1px solid var(--edge2)' }}
        />
        <p
          className="mono text-[10px] uppercase tracking-[0.3em] mb-2"
          style={{ color: themed }}
        >
          {boss.name} のひと言
        </p>
        <p className="serif text-[15px] text-[var(--cream)] leading-relaxed whitespace-pre-line">
          {battle.pending ? battle.pending.reaction : phaseData.demand}
        </p>
      </section>

      {/* Pending reaction (after submission) */}
      {battle.pending ? (
        <div className="space-y-4">
          <div
            className="bg-[var(--card)] border rounded-[var(--r)] p-4 flex items-center justify-between"
            style={{ borderColor: QUALITY_COLOR[battle.pending.quality] }}
          >
            <div>
              <p
                className="mono text-[10px] uppercase tracking-widest"
                style={{ color: QUALITY_COLOR[battle.pending.quality] }}
              >
                {QUALITY_LABEL[battle.pending.quality]}
              </p>
              <p className="serif text-base text-[var(--cream)]">
                {battle.pending.damage > 0
                  ? `${battle.pending.damage} ダメージ！`
                  : 'ダメージなし'}
              </p>
            </div>
            <div className="text-right">
              <p className="mono text-[10px] text-[var(--text-3)] uppercase tracking-widest">
                Boss HP
              </p>
              <p className="mono text-lg" style={{ color: themed }}>
                {battle.hp} / {battle.maxHp}
              </p>
            </div>
          </div>

          <BaseButton
            fullWidth
            size="lg"
            onClick={() => advanceBossPhase()}
          >
            {battle.hp <= 0
              ? '撃破を確定する'
              : battle.phase >= 3
                ? '結果を確認する'
                : '次のフェーズへ'}
          </BaseButton>
        </div>
      ) : (
        <div className="space-y-3">
          {phaseData.choices.map((c) => {
            const isSelected = selected === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelected(c.key)}
                className={`w-full text-left p-4 rounded-[var(--r-sm)] border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[var(--accent-l)] border-[var(--accent)]'
                    : 'bg-[var(--card)] border-[var(--edge2)] hover:border-[var(--text-3)]'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <span
                    className={`mono text-xs font-bold w-6 h-6 inline-flex items-center justify-center rounded-[var(--r-sm)] shrink-0 ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[var(--cream)]'
                        : 'bg-[var(--card2)] text-[var(--text-2)]'
                    }`}
                  >
                    {c.key}
                  </span>
                  <span className="text-[13px] text-[var(--text)] leading-relaxed">
                    {c.text}
                  </span>
                </div>
              </button>
            );
          })}

          <BaseButton
            fullWidth
            size="lg"
            disabled={!selected}
            onClick={() => selected && submitBossChoice(selected)}
          >
            この回答で反論する
          </BaseButton>
        </div>
      )}
    </main>
  );
}

function HpBar({ hp, max, color }: { hp: number; max: number; color: string }) {
  const ratio = Math.max(0, Math.min(1, hp / max));
  return (
    <div className="h-3 bg-[var(--card2)] border border-[var(--edge2)] rounded-[var(--r-sm)] overflow-hidden">
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{
          width: `${ratio * 100}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        }}
      />
    </div>
  );
}

function RewardTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-[var(--card2)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3">
      <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">
        {label}
      </div>
      <div className="serif text-lg" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

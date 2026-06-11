'use client';

// QA Quest — バトル画面（手札・敵・インテント・演出）

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import BaseButton from '@/components/common/BaseButton';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import CardView from '@/components/battle/CardView';
import EnemySprite from '@/components/battle/EnemySprite';
import { useRunStore } from '@/lib/runStore';
import { resolvedCost, resolvedEffects } from '@/lib/battle';
import { ACT_META, NODE_META } from '@/lib/constants';
import { findEnemy } from '@/data/enemies';
import type { EnemyInstance, EnemyMove, FxEvent } from '@/types';

export default function BattleView() {
  const battle = useRunStore((s) => s.battle);
  const battleKind = useRunStore((s) => s.battleKind);
  const act = useRunStore((s) => s.act);
  const hp = useRunStore((s) => s.hp);
  const maxHp = useRunStore((s) => s.maxHp);
  const playCardAction = useRunStore((s) => s.playCardAction);
  const endTurnAction = useRunStore((s) => s.endTurnAction);
  const stepEnemy = useRunStore((s) => s.stepEnemy);
  const finishDefeat = useRunStore((s) => s.finishDefeat);

  const [selected, setSelected] = useState<number | null>(null);
  const [hitUid, setHitUid] = useState<string | null>(null);

  const phase = battle?.phase;
  const enemyCursor = battle?.enemyCursor ?? 0;

  // 敵ターンを 700ms 間隔で順番に解決
  useEffect(() => {
    if (phase !== 'enemy') return;
    const t = setTimeout(() => stepEnemy(), 700);
    return () => clearTimeout(t);
  }, [phase, enemyCursor, stepEnemy]);

  // 最新 fx から被弾モーション
  const lastFx = battle?.fx[battle.fx.length - 1];
  useEffect(() => {
    if (!lastFx) return;
    if (lastFx.kind === 'damage') {
      setHitUid(lastFx.target);
      const t = setTimeout(() => setHitUid(null), 380);
      return () => clearTimeout(t);
    }
  }, [lastFx?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const alive = useMemo(
    () => (battle ? battle.enemies.filter((e) => !e.dead) : []),
    [battle]
  );

  if (!battle) return null;

  const actMeta = ACT_META[act - 1];
  const nodeMeta = battleKind ? NODE_META[battleKind] : NODE_META.battle;
  const enemyBanner = [...battle.fx].reverse().find((f) => f.kind === 'enemyAttack');

  function onCardClick(i: number) {
    if (!battle || battle.phase !== 'player') return;
    const card = battle.hand[i];
    if (!card) return;
    const eff = resolvedEffects(card);
    const cost = resolvedCost(card);
    const canPay = eff.xCost ? battle.energy > 0 : cost <= battle.energy;
    if (!canPay) return;
    const needsTarget =
      (eff.damage !== undefined || eff.vulnerable !== undefined) &&
      (eff.target ?? 'single') === 'single' &&
      alive.length > 1;
    if (needsTarget) {
      setSelected(selected === i ? null : i);
    } else {
      playCardAction(i, alive[0]?.uid ?? null);
      setSelected(null);
    }
  }

  function onEnemyClick(uid: string) {
    if (selected === null) return;
    playCardAction(selected, uid);
    setSelected(null);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-6">
      {/* ヘッダー */}
      <header className="flex items-center justify-between rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] px-4 py-2 mb-4">
        <div>
          <p className="mono text-[9px] tracking-[0.25em] uppercase" style={{ color: actMeta.color }}>
            {actMeta.name} · {actMeta.title}
          </p>
          <p className="serif text-sm font-bold text-[var(--cream)]">
            {nodeMeta.label}
            {battle.isBoss && ' — 大障害発生'}
          </p>
        </div>
        <div className="text-right">
          <p className="mono text-[10px] text-[var(--text-3)]">TURN {battle.turn}</p>
          <p className="mono text-[10px] text-[var(--text-3)]">
            山札 {battle.drawPile.length} · 捨札 {battle.discardPile.length}
          </p>
        </div>
      </header>

      {/* 敵ゾーン */}
      <section className="relative rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--deep)] px-4 pt-6 pb-4 min-h-[230px]">
        {enemyBanner && battle.phase === 'enemy' && (
          <p
            key={enemyBanner.id}
            className="qa-banner absolute top-2 left-1/2 -translate-x-1/2 mono text-[11px] px-3 py-1 rounded-full border border-[var(--danger)] text-[var(--danger)] bg-[var(--card)]"
          >
            {enemyBanner.label}
          </p>
        )}
        <div className="flex items-end justify-center gap-6 flex-wrap">
          {battle.enemies.map((e) => (
            <EnemyFigure
              key={e.uid}
              enemy={e}
              fx={battle.fx}
              hit={hitUid === e.uid}
              targetable={selected !== null && !e.dead}
              onClick={() => onEnemyClick(e.uid)}
            />
          ))}
        </div>
        {selected !== null && (
          <p className="text-center mono text-[11px] text-[var(--accent)] mt-2 qa-pulse">
            対象のバグを選択 — もう一度カードを押すと解除
          </p>
        )}
      </section>

      {/* プレイヤーゾーン */}
      <section
        className={clsx(
          'relative mt-3 rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] px-4 py-3',
          hitUid === 'player' && 'qa-player-hit'
        )}
      >
        <PlayerFx fx={battle.fx} />
        <div className="flex items-center gap-4">
          {/* 工数オーブ */}
          <div
            className="w-14 h-14 rounded-full grid place-items-center border-2 shrink-0"
            style={{ borderColor: 'var(--brass)', background: 'var(--brass-l)' }}
          >
            <div className="text-center leading-none">
              <p className="serif text-lg font-bold text-[var(--brass-d)]">
                {battle.energy}
                <span className="text-[10px] text-[var(--text-3)]">/{battle.maxEnergy}</span>
              </p>
              <p className="mono text-[8px] text-[var(--text-3)] mt-0.5">工数</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="serif text-xs font-bold text-[var(--cream)]">QA テスター</span>
              <div className="flex gap-1.5">
                {battle.block > 0 && <Chip label={`防 ${battle.block}`} color="var(--info)" />}
                {battle.focus > 0 && <Chip label={`集中 +${battle.focus}`} color="var(--brass-d)" />}
                {battle.playerWeak > 0 && <Chip label={`萎縮 ${battle.playerWeak}`} color="var(--danger)" />}
              </div>
            </div>
            <BaseProgressBar
              value={hp}
              max={maxHp}
              color={hp / maxHp < 0.3 ? 'var(--danger)' : hp / maxHp < 0.6 ? 'var(--warn)' : 'var(--success)'}
              height={10}
              showLabel
              label="メンタル"
            />
          </div>

          <BaseButton
            size="md"
            variant={battle.phase === 'player' ? 'primary' : 'ghost'}
            disabled={battle.phase !== 'player'}
            onClick={() => {
              setSelected(null);
              endTurnAction();
            }}
          >
            {battle.phase === 'enemy' ? 'バグの反撃…' : 'ターン終了'}
          </BaseButton>
        </div>
      </section>

      {/* 手札 */}
      <section className="mt-4 flex justify-center gap-2 flex-wrap min-h-[210px]">
        {battle.hand.map((c, i) => {
          const eff = resolvedEffects(c);
          const cost = resolvedCost(c);
          const playable =
            battle.phase === 'player' && (eff.xCost ? battle.energy > 0 : cost <= battle.energy);
          return (
            <div key={c.uid} className="qa-card-in">
              <CardView
                card={c}
                playable={playable}
                selected={selected === i}
                onClick={() => onCardClick(i)}
              />
            </div>
          );
        })}
        {battle.hand.length === 0 && battle.phase === 'player' && (
          <p className="self-center text-[var(--text-3)] text-xs">手札がない。ターンを終了しよう。</p>
        )}
      </section>

      {/* 敗北オーバーレイ */}
      {battle.phase === 'lost' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(42,37,32,0.55)] px-6">
          <div className="qa-overlay-in w-full max-w-sm rounded-[var(--r)] border-2 border-[var(--danger)] bg-[var(--card)] p-6 text-center space-y-4">
            <p className="mono text-[10px] tracking-[0.3em] text-[var(--danger)] uppercase">Burnout</p>
            <h2 className="serif text-2xl font-bold text-[var(--cream)]">メンタルが尽きた…</h2>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              バグの猛攻に飲み込まれた。だが、この戦いの記録は次の挑戦の糧になる。
            </p>
            <BaseButton fullWidth size="lg" onClick={finishDefeat}>
              戦いの記録を見る
            </BaseButton>
          </div>
        </div>
      )}
    </div>
  );
}

/*──────────── 敵 1 体 ────────────*/

function EnemyFigure({
  enemy,
  fx,
  hit,
  targetable,
  onClick,
}: {
  enemy: EnemyInstance;
  fx: FxEvent[];
  hit: boolean;
  targetable: boolean;
  onClick: () => void;
}) {
  const def = findEnemy(enemy.defId);
  if (!def) return null;
  const size = Math.round(104 * (def.scale ?? 1));
  const isBoss = !!def.title;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!targetable || enemy.dead}
      className={clsx(
        'relative flex flex-col items-center transition-transform',
        targetable && !enemy.dead && 'cursor-crosshair hover:scale-105',
        enemy.dead && 'pointer-events-none'
      )}
    >
      {/* インテント */}
      {!enemy.dead && <Intent move={enemy.nextMove} strength={enemy.strength} />}

      {/* 浮遊ダメージ */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
        {fx
          .filter((f) => f.target === enemy.uid && f.kind === 'damage')
          .map((f) => (
            <span
              key={f.id}
              className="qa-float absolute left-1/2 top-1/3 mono font-bold text-xl"
              style={{ color: 'var(--accent)' }}
            >
              -{f.amount}
            </span>
          ))}
        {fx
          .filter((f) => f.target === enemy.uid && f.kind === 'status')
          .map((f) => (
            <span
              key={f.id}
              className="qa-float absolute left-1/2 top-1/2 mono text-xs"
              style={{ color: 'var(--info)' }}
            >
              {f.label}
            </span>
          ))}
      </div>

      <div className={clsx(targetable && !enemy.dead && 'qa-target-ring rounded-full')}>
        <EnemySprite
          kind={def.sprite}
          color={def.color}
          size={size}
          hit={hit}
          dead={enemy.dead}
          boss={isBoss}
        />
      </div>

      <p className={clsx('serif text-xs font-bold mt-1', enemy.dead ? 'text-[var(--text-3)] line-through' : 'text-[var(--cream)]')}>
        {def.title && (
          <span className="mono text-[8px] tracking-widest mr-1" style={{ color: def.color }}>
            {def.title}
          </span>
        )}
        {def.name}
      </p>

      {!enemy.dead && (
        <>
          <div className="w-[100px] mt-1">
            <BaseProgressBar value={enemy.hp} max={enemy.maxHp} color={def.color} height={6} />
          </div>
          <p className="mono text-[9px] text-[var(--text-3)] mt-0.5">
            {enemy.hp}/{enemy.maxHp}
          </p>
          <div className="flex gap-1 mt-0.5 flex-wrap justify-center">
            {enemy.block > 0 && <Chip label={`守 ${enemy.block}`} color="var(--info)" />}
            {enemy.vulnerable > 0 && <Chip label={`特定 ${enemy.vulnerable}`} color="var(--accent)" />}
            {enemy.weak > 0 && <Chip label={`萎縮 ${enemy.weak}`} color="var(--st-mgmt)" />}
            {enemy.strength > 0 && <Chip label={`増強 +${enemy.strength}`} color="var(--danger)" />}
          </div>
        </>
      )}
      {enemy.dead && <p className="mono text-[9px] text-[var(--success)] mt-1">退治完了</p>}
    </button>
  );
}

/*──────────── インテント ────────────*/

function Intent({ move, strength }: { move: EnemyMove; strength: number }) {
  let glyph = '撃';
  let color = 'var(--danger)';
  let detail = '';
  if (move.kind === 'attack' || move.kind === 'big') {
    const dmg = (move.damage ?? 0) + strength;
    glyph = move.kind === 'big' ? '大' : '撃';
    detail = move.hits && move.hits > 1 ? `${dmg}×${move.hits}` : `${dmg}`;
    if (move.weakPlayer) detail += ' 妨';
  } else if (move.kind === 'block') {
    glyph = '守';
    color = 'var(--info)';
    detail = `${move.block ?? ''}`;
  } else if (move.kind === 'buff') {
    glyph = '強';
    color = 'var(--warn)';
    detail = `+${move.strength ?? ''}`;
  } else if (move.kind === 'debuff') {
    glyph = '妨';
    color = 'var(--st-mgmt)';
    detail = move.damage ? `${(move.damage ?? 0) + strength}` : '';
  }
  return (
    <div
      className="qa-intent flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full border bg-[var(--card)]"
      style={{ borderColor: color }}
      title={move.label}
    >
      <span className="serif text-xs font-bold" style={{ color }}>
        {glyph}
      </span>
      {detail && (
        <span className="mono text-[10px] font-bold" style={{ color }}>
          {detail}
        </span>
      )}
    </div>
  );
}

/*──────────── 小物 ────────────*/

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="mono text-[8.5px] px-1.5 py-px rounded-full border"
      style={{ color, borderColor: color, background: 'var(--card)' }}
    >
      {label}
    </span>
  );
}

function PlayerFx({ fx }: { fx: FxEvent[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {fx
        .filter((f) => f.target === 'player' && f.kind === 'damage')
        .map((f) => (
          <span
            key={f.id}
            className="qa-float absolute left-1/3 top-0 mono font-bold text-xl"
            style={{ color: 'var(--danger)' }}
          >
            -{f.amount}
          </span>
        ))}
      {fx
        .filter((f) => f.target === 'player' && f.kind === 'block')
        .map((f) => (
          <span
            key={f.id}
            className="qa-float absolute left-2/3 top-0 mono font-bold text-base"
            style={{ color: 'var(--info)' }}
          >
            +{f.amount} 防
          </span>
        ))}
      {fx
        .filter((f) => f.target === 'player' && f.kind === 'heal')
        .map((f) => (
          <span
            key={f.id}
            className="qa-float absolute left-1/2 top-0 mono font-bold text-base"
            style={{ color: 'var(--success)' }}
          >
            +{f.amount}
          </span>
        ))}
    </div>
  );
}

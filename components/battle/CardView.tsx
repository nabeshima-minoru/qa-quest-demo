'use client';

// QA Quest — 和紙調カード

import clsx from 'clsx';
import { CARD_TYPE_META, RARITY_META } from '@/lib/constants';
import { findCard } from '@/data/cards';
import { resolvedCost } from '@/lib/battle';
import type { CardInstance } from '@/types';

interface Props {
  card: CardInstance;
  playable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  /** 一覧表示用の小型サイズ */
  small?: boolean;
}

export default function CardView({ card, playable = true, selected, onClick, small }: Props) {
  const def = findCard(card.defId);
  if (!def) return null;
  const cost = resolvedCost(card);
  const typeMeta = CARD_TYPE_META[def.type];
  const rarityMeta = RARITY_META[def.rarity];
  const text = card.upgraded ? def.upgradeText : def.text;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        'relative shrink-0 text-left rounded-[var(--r)] border bg-[var(--card)] overflow-hidden',
        'transition-all duration-150',
        small ? 'w-[124px] h-[168px]' : 'w-[148px] h-[200px]',
        selected
          ? 'border-[var(--accent)] shadow-[0_10px_24px_rgba(184,92,92,0.35)] -translate-y-3'
          : 'border-[var(--edge2)]',
        onClick && playable && !selected && 'hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(40,32,20,0.18)]',
        !playable && 'opacity-45 saturate-50',
        card.upgraded && 'qa-card-upgraded'
      )}
      style={{ borderTopWidth: 3, borderTopColor: typeMeta.color }}
    >
      {/* コスト */}
      <span
        className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full grid place-items-center mono text-sm font-bold border"
        style={{
          background: 'var(--brass-l)',
          borderColor: 'var(--brass)',
          color: 'var(--brass-d)',
        }}
      >
        {cost < 0 ? 'X' : cost}
      </span>
      {/* レアリティ */}
      <span
        className="absolute top-2 right-2 mono text-[9px] px-1 border rounded-sm"
        style={{ color: rarityMeta.color, borderColor: rarityMeta.color }}
      >
        {rarityMeta.label}
      </span>

      {/* グリフ（円相を背景に） */}
      <div className={clsx('relative grid place-items-center', small ? 'h-[72px] mt-4' : 'h-[88px] mt-5')}>
        <span
          className="absolute rounded-full border-2 opacity-25"
          style={{
            width: small ? 52 : 62,
            height: small ? 52 : 62,
            borderColor: typeMeta.color,
          }}
        />
        <span
          className={clsx('serif font-bold', small ? 'text-3xl' : 'text-4xl')}
          style={{ color: card.upgraded ? 'var(--brass-d)' : 'var(--cream)' }}
        >
          {def.glyph}
        </span>
      </div>

      {/* 名前 */}
      <p
        className={clsx(
          'serif text-center font-bold leading-tight px-1.5 text-[var(--cream)]',
          small ? 'text-[11px]' : 'text-[12.5px]'
        )}
      >
        {def.name}
        {card.upgraded && <span className="text-[var(--brass-d)]">+</span>}
      </p>

      {/* タイプ */}
      <p className="text-center mono text-[8.5px] tracking-widest mt-0.5" style={{ color: typeMeta.color }}>
        {typeMeta.label}
      </p>

      {/* 効果テキスト */}
      <p
        className={clsx(
          'text-center text-[var(--text-2)] leading-snug px-2 mt-1',
          small ? 'text-[9.5px]' : 'text-[10.5px]'
        )}
      >
        {text}
      </p>
    </button>
  );
}

'use client';

import clsx from 'clsx';
import { RARITY_META, STAT_LABELS, WEAPON_CATEGORY_META } from '@/lib/constants';
import { findWeapon } from '@/data/weapons';
import type { StatKey, Weapon } from '@/types';

interface Props {
  weaponId?: string;
  weapon?: Weapon;
  level?: number;
  /** ボタンとして使う場合 */
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  /** パッシブ補正を表示するか */
  showPassive?: boolean;
  /** 右肩の追加ラベル（バトルのダメージ予測など） */
  badge?: string;
  compact?: boolean;
}

export default function WeaponCard({
  weaponId,
  weapon: weaponProp,
  level = 1,
  onClick,
  selected,
  disabled,
  showPassive = true,
  badge,
  compact,
}: Props) {
  const weapon = weaponProp ?? (weaponId ? findWeapon(weaponId) : undefined);
  if (!weapon) return null;

  const cat = WEAPON_CATEGORY_META[weapon.category];
  const rarity = RARITY_META[weapon.rarity];

  const passiveEntries = Object.entries(weapon.passive) as [StatKey, number][];

  const interactive = !!onClick;
  const Tag: keyof JSX.IntrinsicElements = interactive ? 'button' : 'div';

  return (
    <Tag
      {...(interactive ? { type: 'button', onClick, disabled } : {})}
      className={clsx(
        'text-left w-full rounded-[var(--r-sm)] border p-3 transition-all duration-150',
        'bg-[var(--card)]',
        selected
          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
          : 'border-[var(--edge2)]',
        interactive && !disabled && 'hover:border-[var(--text-3)] cursor-pointer',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: cat.color }}
    >
      <div className="flex items-start gap-2.5">
        {/* glyph chip */}
        <div
          className="shrink-0 grid place-items-center rounded-[var(--r-sm)] font-bold serif"
          style={{
            width: compact ? 34 : 40,
            height: compact ? 34 : 40,
            background: `color-mix(in srgb, ${cat.color} 16%, var(--card))`,
            color: cat.color,
            fontSize: weapon.glyph.length > 2 ? 11 : 14,
            border: `1px solid color-mix(in srgb, ${cat.color} 40%, transparent)`,
          }}
        >
          {weapon.glyph}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[var(--cream)] leading-tight truncate">
              {weapon.name}
            </span>
            <span
              className="mono text-[9px] px-1 py-0.5 rounded-sm shrink-0"
              style={{
                color: rarity.color,
                border: `1px solid ${rarity.color}`,
              }}
            >
              {rarity.label}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="mono text-[9px]" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <span className="mono text-[9px] text-[var(--text-3)]">
              ATK {weapon.power} · {STAT_LABELS[weapon.scaleStat]}依存
            </span>
            {level > 1 && (
              <span className="mono text-[9px] text-[var(--brass)]">Lv.{level}</span>
            )}
            {badge && (
              <span className="mono text-[9px] text-[var(--accent)] font-bold">{badge}</span>
            )}
          </div>

          {showPassive && passiveEntries.length > 0 && !compact && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {passiveEntries.map(([k, v]) => (
                <span
                  key={k}
                  className="mono text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--card2)] text-[var(--text-2)]"
                >
                  {STAT_LABELS[k]} +{v}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Tag>
  );
}

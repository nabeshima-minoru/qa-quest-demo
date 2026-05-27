'use client';

import clsx from 'clsx';

interface Props {
  value: number;
  max?: number;
  color?: string; // CSS color value
  height?: number; // px
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export default function BaseProgressBar({
  value,
  max = 100,
  color = 'var(--accent)',
  height = 6,
  showLabel = false,
  label,
  className,
}: Props) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-[11px] text-[var(--text-2)] mb-1">
          <span>{label ?? ''}</span>
          <span className="mono">
            {Math.round(value)} / {max}
          </span>
        </div>
      )}
      <div
        className="w-full bg-[var(--card2)] overflow-hidden rounded-[var(--r-sm)]"
        style={{ height }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

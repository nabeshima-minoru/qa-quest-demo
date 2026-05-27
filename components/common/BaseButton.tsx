'use client';

import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export default function BaseButton({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none border';

  const variants: Record<Variant, string> = {
    primary:
      'bg-[var(--accent)] text-[var(--cream)] border-[var(--accent-d)] hover:bg-[var(--accent-d)]',
    secondary:
      'bg-[var(--card)] text-[var(--cream)] border-[var(--edge2)] hover:bg-[var(--card2)]',
    ghost:
      'bg-transparent text-[var(--text)] border-[var(--edge2)] hover:bg-[var(--card)]',
    danger:
      'bg-[var(--danger)] text-[var(--cream)] border-[var(--danger)] hover:opacity-90',
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      {...rest}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        'rounded-[var(--r-sm)]',
        className
      )}
    >
      {children}
    </button>
  );
}

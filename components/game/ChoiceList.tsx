'use client';

import { useState } from 'react';
import BaseButton from '@/components/common/BaseButton';
import type { Choice } from '@/types';

interface Props {
  choices: Choice[];
  onSubmit: (key: Choice['key']) => void;
  disabled?: boolean;
}

export default function ChoiceList({ choices, onSubmit, disabled }: Props) {
  const [selected, setSelected] = useState<Choice['key'] | null>(null);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {choices.map((c) => {
          const isSelected = selected === c.key;
          return (
            <button
              key={c.key}
              type="button"
              disabled={disabled}
              onClick={() => setSelected(c.key)}
              className={`w-full text-left p-4 transition-all duration-150 rounded-[var(--r-sm)] border ${
                isSelected
                  ? 'bg-[var(--accent-l)] border-[var(--accent)]'
                  : 'bg-[var(--card2)] border-[var(--edge2)] hover:border-[var(--text-3)]'
              } disabled:opacity-50`}
            >
              <div className="flex gap-3 items-start">
                <span
                  className={`mono text-xs font-bold w-6 h-6 inline-flex items-center justify-center rounded-[var(--r-sm)] shrink-0 ${
                    isSelected
                      ? 'bg-[var(--accent)] text-[var(--cream)]'
                      : 'bg-[var(--card)] text-[var(--text-2)]'
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
      </div>

      <div className="pt-2">
        <BaseButton
          fullWidth
          size="lg"
          disabled={!selected || disabled}
          onClick={() => selected && onSubmit(selected)}
        >
          決定する
        </BaseButton>
      </div>
    </div>
  );
}

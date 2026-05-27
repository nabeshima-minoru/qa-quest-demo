'use client';

import type { GameEvent } from '@/types';

const CATEGORY_LABEL: Record<GameEvent['category'], string> = {
  case: '案件',
  study: '学習',
  trouble: 'トラブル',
  social: '交流',
  hidden: '隠し',
};

const CATEGORY_COLOR: Record<GameEvent['category'], string> = {
  case: 'var(--st-tech)',
  study: 'var(--st-anal)',
  trouble: 'var(--danger)',
  social: 'var(--st-comm)',
  hidden: 'var(--st-ai)',
};

interface Props {
  event: GameEvent;
}

export default function EventCard({ event }: Props) {
  return (
    <article className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-6 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block px-2 py-0.5 text-[10px] mono uppercase tracking-widest"
            style={{
              background: CATEGORY_COLOR[event.category] + '22',
              color: CATEGORY_COLOR[event.category],
              border: `1px solid ${CATEGORY_COLOR[event.category]}55`,
              borderRadius: 'var(--r-sm)',
            }}
          >
            {CATEGORY_LABEL[event.category]}
          </span>
          <span className="mono text-[10px] text-[var(--text-3)]">{event.id}</span>
        </div>
        <h2 className="serif text-xl text-[var(--cream)] leading-tight">
          {event.title}
        </h2>
      </header>
      <p className="text-[var(--text)] leading-relaxed whitespace-pre-line text-[13px]">
        {event.description}
      </p>
    </article>
  );
}

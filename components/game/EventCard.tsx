'use client';

import type { GameEvent } from '@/types';

interface CategoryMeta {
  label: string;
  color: string;
  glyph: string;
  /** 上部アクセントバーの強さ */
  emphasis: 'normal' | 'strong' | 'rare';
  /** 説明文の前置きテキスト（カテゴリの雰囲気付け） */
  intro?: string;
}

const CATEGORY_META: Record<GameEvent['category'], CategoryMeta> = {
  case: {
    label: '案件',
    color: 'var(--st-tech)',
    glyph: '◆',
    emphasis: 'normal',
  },
  study: {
    label: '学習',
    color: 'var(--st-anal)',
    glyph: '◇',
    emphasis: 'normal',
    intro: '— 学びの機会 —',
  },
  trouble: {
    label: '緊急対応',
    color: 'var(--danger)',
    glyph: '⚠',
    emphasis: 'strong',
    intro: '— 緊急事態発生 —',
  },
  social: {
    label: '交流',
    color: 'var(--st-comm)',
    glyph: '○',
    emphasis: 'normal',
  },
  hidden: {
    label: '特異事象',
    color: 'var(--st-ai)',
    glyph: '✦',
    emphasis: 'rare',
    intro: '— 稀有な瞬間 —',
  },
};

interface Props {
  event: GameEvent;
}

export default function EventCard({ event }: Props) {
  const meta = CATEGORY_META[event.category];

  // カテゴリ別の演出クラス
  const wrapperClass =
    meta.emphasis === 'strong'
      ? 'qa-evt-trouble'
      : meta.emphasis === 'rare'
        ? 'qa-evt-rare'
        : '';

  // 案件はメンターIDで重要案件か区別、weight が高い (>=12) は重要案件と仮にみなす
  const isFlagshipCase =
    event.category === 'case' && (event.weight >= 12 || !!event.mentorId);

  return (
    <article
      className={`qa-evt-card relative bg-[var(--card)] border rounded-[var(--r)] p-6 space-y-4 overflow-hidden ${wrapperClass}`}
      style={{
        borderColor:
          meta.emphasis === 'strong' || meta.emphasis === 'rare'
            ? meta.color
            : 'var(--edge2)',
      }}
    >
      {/* 上部のカテゴリ・アクセントバー */}
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0"
        style={{
          height: meta.emphasis === 'normal' ? 2 : 3,
          background: meta.color,
          opacity: meta.emphasis === 'rare' ? 0.9 : 0.7,
        }}
      />

      {/* レアイベント専用バッジ */}
      {meta.emphasis === 'rare' && (
        <div className="absolute top-3 right-3 mono text-[9px] uppercase tracking-[0.3em] px-2 py-1 rounded-[var(--r-sm)]"
          style={{
            color: meta.color,
            background: 'var(--card2)',
            border: `1px solid ${meta.color}`,
          }}
        >
          ★ Rare Event
        </div>
      )}

      {/* 緊急イベント専用バッジ */}
      {meta.emphasis === 'strong' && (
        <div className="absolute top-3 right-3 mono text-[9px] uppercase tracking-[0.3em] px-2 py-1 rounded-[var(--r-sm)] qa-evt-trouble-badge"
          style={{
            color: 'var(--cream)',
            background: meta.color,
          }}
        >
          ! Alert
        </div>
      )}

      {/* 旗艦案件バッジ */}
      {isFlagshipCase && (
        <div className="absolute top-3 right-3 mono text-[9px] uppercase tracking-[0.3em] px-2 py-1 rounded-[var(--r-sm)]"
          style={{
            color: 'var(--brass)',
            background: 'var(--brass-l)',
            border: '1px solid var(--brass)',
          }}
        >
          ◆ Key Case
        </div>
      )}

      <header className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] mono uppercase tracking-widest"
            style={{
              background: meta.color + '22',
              color: meta.color,
              border: `1px solid ${meta.color}55`,
              borderRadius: 'var(--r-sm)',
            }}
          >
            <span aria-hidden>{meta.glyph}</span>
            {meta.label}
          </span>
          <span className="mono text-[10px] text-[var(--text-3)]">{event.id}</span>
          {event.mentorId && (
            <span
              className="mono text-[10px] text-[var(--brass)] ml-auto"
              style={{ paddingRight: meta.emphasis !== 'normal' || isFlagshipCase ? 88 : 0 }}
            >
              {event.mentorId}
            </span>
          )}
        </div>
        {meta.intro && (
          <p
            className="serif text-[11px] tracking-wider"
            style={{ color: meta.color }}
          >
            {meta.intro}
          </p>
        )}
        <h2 className="serif text-xl text-[var(--cream)] leading-tight">
          {event.title}
        </h2>
      </header>

      <p className="text-[var(--text)] leading-relaxed whitespace-pre-line text-[13px]">
        {event.description}
      </p>

      {/* クイズトリガーイベントの予告 */}
      {event.quizTrigger && (
        <div
          className="mono text-[10px] uppercase tracking-[0.3em] px-3 py-2 rounded-[var(--r-sm)]"
          style={{
            color: 'var(--brass)',
            background: 'var(--brass-l)',
            border: '1px dashed var(--brass)',
          }}
        >
          ※ この結果は JSTQB クイズに繋がります
        </div>
      )}
    </article>
  );
}

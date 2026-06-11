'use client';

// QA Quest — 幕マップ（SVG ノードグラフ）
// 下から上へ進む。選択可能ノードが脈動する。

import { useMemo } from 'react';
import { useRunStore, selectableNodeIds } from '@/lib/runStore';
import { findNode } from '@/lib/mapGen';
import { ACT_META, NODE_META } from '@/lib/constants';
import type { MapNode } from '@/types';

const W = 640;
const ROW_H = 92;
const COL_X = [140, 320, 500];

export default function MapView() {
  const map = useRunStore((s) => s.map);
  const positionId = useRunStore((s) => s.positionId);
  const act = useRunStore((s) => s.act);
  const enterNode = useRunStore((s) => s.enterNode);

  const selectable = useMemo(
    () => new Set(selectableNodeIds(map, positionId)),
    [map, positionId]
  );

  if (!map) return null;

  const actMeta = ACT_META[act - 1];
  const H = map.rows * ROW_H + 70;
  const pos = (n: MapNode) => ({
    x: n.kind === 'boss' ? W / 2 : COL_X[n.col],
    y: H - 50 - n.row * ROW_H,
  });
  const currentRow = positionId ? (findNode(map, positionId)?.row ?? -1) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-8">
      <header className="text-center mb-2">
        <p className="mono text-[10px] tracking-[0.3em] uppercase" style={{ color: actMeta.color }}>
          {actMeta.name} / {ACT_META.length}幕
        </p>
        <h2 className="serif text-2xl font-bold text-[var(--cream)]">{actMeta.title}</h2>
        <p className="text-[11px] text-[var(--text-2)] mt-0.5">{actMeta.subtitle}</p>
        <p className="mono text-[10px] text-[var(--text-3)] mt-2 qa-pulse">
          {positionId === null ? '最初の現場を選ぼう' : '光るノードへ進もう'}
        </p>
      </header>

      <div className="rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--deep)] overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
          {/* エッジ */}
          {map.nodes.map((n) =>
            n.next.map((nid) => {
              const m = findNode(map, nid);
              if (!m) return null;
              const a = pos(n);
              const b = pos(m);
              const active = selectable.has(nid) && (positionId === n.id || (positionId === null && n.row === 0));
              return (
                <path
                  key={`${n.id}-${nid}`}
                  d={`M ${a.x} ${a.y - 24} C ${a.x} ${a.y - 56}, ${b.x} ${b.y + 56}, ${b.x} ${b.y + 26}`}
                  fill="none"
                  stroke={active ? 'var(--accent)' : 'var(--edge2)'}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeDasharray={active ? 'none' : '4 5'}
                />
              );
            })
          )}

          {/* ノード */}
          {map.nodes.map((n) => {
            const { x, y } = pos(n);
            const meta = NODE_META[n.kind];
            const isCurrent = positionId === n.id;
            const canGo = selectable.has(n.id);
            const passed = n.row < currentRow || (isCurrent && false);
            const r = n.kind === 'boss' ? 30 : 22;
            return (
              <g
                key={n.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => canGo && enterNode(n.id)}
                className={canGo ? 'cursor-pointer' : undefined}
                opacity={passed && !isCurrent ? 0.35 : 1}
              >
                {canGo && (
                  <circle r={r + 7} fill="none" stroke="var(--accent)" strokeWidth="2" className="qa-node-ring" />
                )}
                <circle
                  r={r}
                  fill={isCurrent ? meta.color : 'var(--card)'}
                  stroke={canGo ? 'var(--accent)' : meta.color}
                  strokeWidth={canGo ? 2.5 : 2}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={n.kind === 'boss' ? 22 : 17}
                  fontFamily="var(--fs)"
                  fontWeight="700"
                  fill={isCurrent ? '#FBF7EE' : meta.color}
                >
                  {meta.glyph}
                </text>
                <text
                  textAnchor="middle"
                  y={r + 16}
                  fontSize="10"
                  fontFamily="var(--fn)"
                  fill="var(--text-2)"
                >
                  {meta.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 凡例 */}
      <div className="flex justify-center gap-3 mt-3 flex-wrap">
        {(Object.keys(NODE_META) as Array<keyof typeof NODE_META>).map((k) => (
          <span key={k} className="flex items-center gap-1 mono text-[9px] text-[var(--text-3)]">
            <span
              className="serif font-bold text-[11px]"
              style={{ color: NODE_META[k].color }}
            >
              {NODE_META[k].glyph}
            </span>
            {NODE_META[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}

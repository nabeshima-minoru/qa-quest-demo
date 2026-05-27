'use client';

import { useMemo } from 'react';
import { BALANCE, STAT_COLORS, STAT_LABELS } from '@/lib/constants';
import type { Stats, StatKey } from '@/types';

interface Props {
  stats: Stats;
  size?: number;
}

const STAT_ORDER: StatKey[] = ['tech', 'comm', 'analysis', 'mgmt', 'ai'];

export default function SkillRadar({ stats, size = 280 }: Props) {
  const center = size / 2;
  const radius = size * 0.38;
  const max = BALANCE.STAT_CAP;

  const points = useMemo(() => {
    return STAT_ORDER.map((key, i) => {
      const value = stats[key];
      const angle = (Math.PI * 2 * i) / STAT_ORDER.length - Math.PI / 2;
      const r = (value / max) * radius;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      const labelR = radius + 24;
      const lx = center + Math.cos(angle) * labelR;
      const ly = center + Math.sin(angle) * labelR;
      return { key, x, y, lx, ly, value };
    });
  }, [stats, center, radius, max]);

  const grid = [0.25, 0.5, 0.75, 1].map((scale) => {
    const pts = STAT_ORDER.map((_, i) => {
      const angle = (Math.PI * 2 * i) / STAT_ORDER.length - Math.PI / 2;
      const r = radius * scale;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    }).join(' ');
    return { scale, pts };
  });

  const dataPoly = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* grid */}
      {grid.map((g) => (
        <polygon
          key={g.scale}
          points={g.pts}
          fill="none"
          stroke="var(--edge2)"
          strokeWidth={0.7}
        />
      ))}
      {/* spokes */}
      {STAT_ORDER.map((_, i) => {
        const angle = (Math.PI * 2 * i) / STAT_ORDER.length - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="var(--edge)"
            strokeWidth={0.5}
          />
        );
      })}
      {/* data */}
      <polygon
        points={dataPoly}
        fill="var(--accent-gl)"
        stroke="var(--accent)"
        strokeWidth={1.4}
      />
      {/* points */}
      {points.map((p) => (
        <circle
          key={p.key}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={STAT_COLORS[p.key]}
          stroke="var(--ink)"
          strokeWidth={1}
        />
      ))}
      {/* labels */}
      {points.map((p) => (
        <g key={`l-${p.key}`}>
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontFamily="var(--fn)"
            fill="var(--text-2)"
          >
            {STAT_LABELS[p.key]}
          </text>
          <text
            x={p.lx}
            y={p.ly + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="var(--mono)"
            fill="var(--cream)"
          >
            {p.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

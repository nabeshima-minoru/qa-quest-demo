'use client';

// QA Quest — バグクリーチャー SVG スプライト
// 和紙フラット調。kind × color でバリエーションを描き分ける。

import clsx from 'clsx';
import type { SpriteKind } from '@/types';

interface Props {
  kind: SpriteKind;
  color: string;
  size?: number;
  /** 被弾モーション（短時間 true にする） */
  hit?: boolean;
  dead?: boolean;
  boss?: boolean;
}

const INK = '#2A2520';

function shade(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${100 - pct}%, #2A2520)`;
}
function tint(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${100 - pct}%, #FBF7EE)`;
}

export default function EnemySprite({ kind, color, size = 110, hit, dead, boss }: Props) {
  return (
    <div
      className={clsx(
        'relative select-none',
        dead ? 'qa-en-dead' : 'qa-en-idle',
        hit && !dead && 'qa-en-hit'
      )}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
        {/* 地面の影 */}
        <ellipse cx="60" cy="108" rx="34" ry="6" fill={INK} opacity="0.12" />
        {boss && (
          <g className="qa-aura">
            <circle cx="60" cy="62" r="52" fill={color} opacity="0.10" />
            <circle cx="60" cy="62" r="42" fill={color} opacity="0.10" />
          </g>
        )}
        <Body kind={kind} color={color} />
      </svg>
    </div>
  );
}

function Eyes({
  cx1,
  cx2,
  cy,
  r = 5,
  angry,
}: {
  cx1: number;
  cx2: number;
  cy: number;
  r?: number;
  angry?: boolean;
}) {
  return (
    <g>
      <circle cx={cx1} cy={cy} r={r} fill="#FFFFFF" stroke={INK} strokeWidth="1" />
      <circle cx={cx2} cy={cy} r={r} fill="#FFFFFF" stroke={INK} strokeWidth="1" />
      <circle cx={cx1 + 1} cy={cy + 1} r={r * 0.45} fill={INK} />
      <circle cx={cx2 - 1} cy={cy + 1} r={r * 0.45} fill={INK} />
      {angry && (
        <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
          <line x1={cx1 - r} y1={cy - r - 3} x2={cx1 + r - 1} y2={cy - r + 1} />
          <line x1={cx2 + r} y1={cy - r - 3} x2={cx2 - r + 1} y2={cy - r + 1} />
        </g>
      )}
    </g>
  );
}

function Body({ kind, color }: { kind: SpriteKind; color: string }) {
  switch (kind) {
    case 'blob':
      return (
        <g>
          <path
            d="M60 26 C84 26 98 44 96 66 C94 90 80 102 60 102 C40 102 26 90 24 66 C22 44 36 26 60 26 Z"
            fill={color}
            stroke={shade(color, 35)}
            strokeWidth="2"
          />
          {/* null の空洞 */}
          <circle cx="60" cy="78" r="9" fill={tint(color, 70)} stroke={shade(color, 30)} strokeWidth="1.5" />
          <Eyes cx1={47} cx2={73} cy={54} r={7} />
          <path d="M52 68 Q60 64 68 68" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'mite':
      return (
        <g>
          {/* 脚 */}
          <g stroke={shade(color, 30)} strokeWidth="3" strokeLinecap="round">
            <line x1="38" y1="72" x2="22" y2="60" />
            <line x1="36" y1="82" x2="18" y2="80" />
            <line x1="40" y1="92" x2="26" y2="102" />
            <line x1="82" y1="72" x2="98" y2="60" />
            <line x1="84" y1="82" x2="102" y2="80" />
            <line x1="80" y1="92" x2="94" y2="102" />
          </g>
          <ellipse cx="60" cy="80" rx="26" ry="22" fill={color} stroke={shade(color, 35)} strokeWidth="2" />
          <circle cx="60" cy="52" r="14" fill={tint(color, 15)} stroke={shade(color, 35)} strokeWidth="2" />
          <Eyes cx1={54} cx2={66} cy={51} r={3.5} />
        </g>
      );
    case 'glitch':
      return (
        <g>
          <rect x="30" y="30" width="60" height="22" fill={color} stroke={shade(color, 35)} strokeWidth="2" />
          <rect x="42" y="56" width="60" height="20" fill={tint(color, 20)} stroke={shade(color, 35)} strokeWidth="2" />
          <rect x="22" y="80" width="60" height="22" fill={shade(color, 15)} stroke={shade(color, 40)} strokeWidth="2" />
          {/* スキャンライン */}
          <line x1="30" y1="41" x2="90" y2="41" stroke={tint(color, 55)} strokeWidth="2" />
          <line x1="22" y1="91" x2="82" y2="91" stroke={tint(color, 55)} strokeWidth="2" />
          <Eyes cx1={48} cx2={76} cy={66} r={5.5} />
        </g>
      );
    case 'crab':
      return (
        <g>
          {/* 鋏 */}
          <path d="M22 56 Q8 48 12 34 Q22 40 28 36 Q30 50 22 56 Z" fill={tint(color, 10)} stroke={shade(color, 35)} strokeWidth="2" />
          <path d="M98 56 Q112 46 108 28 Q96 38 90 34 Q88 50 98 56 Z" fill={color} stroke={shade(color, 35)} strokeWidth="2" />
          <text x="14" y="48" fontSize="9" fontFamily="monospace" fill={INK} opacity="0.7">-1</text>
          <text x="94" y="44" fontSize="9" fontFamily="monospace" fill={INK} opacity="0.7">+1</text>
          {/* 体 */}
          <ellipse cx="60" cy="74" rx="30" ry="24" fill={color} stroke={shade(color, 35)} strokeWidth="2" />
          {/* 目柄 */}
          <line x1="50" y1="52" x2="48" y2="42" stroke={shade(color, 30)} strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="52" x2="72" y2="42" stroke={shade(color, 30)} strokeWidth="3" strokeLinecap="round" />
          <Eyes cx1={48} cx2={72} cy={40} r={4.5} />
          {/* 脚 */}
          <g stroke={shade(color, 30)} strokeWidth="3" strokeLinecap="round">
            <line x1="36" y1="92" x2="28" y2="102" />
            <line x1="50" y1="96" x2="46" y2="106" />
            <line x1="70" y1="96" x2="74" y2="106" />
            <line x1="84" y1="92" x2="92" y2="102" />
          </g>
        </g>
      );
    case 'slime':
      return (
        <g>
          <path
            d="M60 30 C88 30 100 56 98 78 C97 94 84 102 60 102 C36 102 23 94 22 78 C20 56 32 30 60 30 Z"
            fill={color}
            stroke={shade(color, 35)}
            strokeWidth="2"
          />
          {/* 滴 */}
          <path d="M30 96 Q28 106 32 110 Q38 106 34 96 Z" fill={color} opacity="0.8" />
          <path d="M88 94 Q90 104 86 110 Q80 104 84 94 Z" fill={color} opacity="0.8" />
          <circle cx="44" cy="44" r="6" fill={tint(color, 40)} opacity="0.8" />
          {/* 眠そうな目 */}
          <path d="M42 62 Q48 58 54 62" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M66 62 Q72 58 78 62" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M54 76 Q60 80 66 76" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'ghost':
      return (
        <g opacity="0.78">
          <path
            d="M60 24 C82 24 92 42 92 62 L92 96 L82 88 L72 98 L60 88 L48 98 L38 88 L28 96 L28 62 C28 42 38 24 60 24 Z"
            fill={tint(color, 25)}
            stroke={shade(color, 25)}
            strokeWidth="2"
          />
          {/* 空洞の目 */}
          <ellipse cx="48" cy="56" rx="5" ry="7" fill={shade(color, 45)} />
          <ellipse cx="72" cy="56" rx="5" ry="7" fill={shade(color, 45)} />
          <ellipse cx="60" cy="72" rx="4" ry="5" fill={shade(color, 45)} opacity="0.7" />
        </g>
      );
    case 'moji':
      return (
        <g>
          <rect x="28" y="30" width="64" height="64" rx="6" fill={color} stroke={shade(color, 35)} strokeWidth="2" />
          <rect x="34" y="36" width="52" height="52" rx="3" fill={tint(color, 65)} />
          <text x="40" y="56" fontSize="15" fontFamily="monospace" fill={INK}>{'Ø▨?'}</text>
          <text x="40" y="74" fontSize="15" fontFamily="monospace" fill={INK}>{'■た;'}</text>
          <Eyes cx1={46} cx2={74} cy={100} r={4} />
          {/* ひび */}
          <path d="M84 30 L78 44 L88 50" stroke={shade(color, 40)} strokeWidth="2" fill="none" />
        </g>
      );
    case 'knot':
      return (
        <g>
          <g fill="none" strokeLinecap="round">
            <circle cx="46" cy="62" r="22" stroke={color} strokeWidth="11" />
            <circle cx="74" cy="62" r="22" stroke={shade(color, 20)} strokeWidth="11" />
            {/* 交差の上書きで絡まり表現 */}
            <path d="M60 44 A22 22 0 0 1 68 62" stroke={color} strokeWidth="11" />
            <path d="M60 80 A22 22 0 0 1 52 62" stroke={shade(color, 20)} strokeWidth="11" />
          </g>
          <Eyes cx1={52} cx2={68} cy={60} r={4.5} angry />
        </g>
      );
    case 'spider':
      return (
        <g>
          <g stroke={shade(color, 25)} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M44 66 L26 52 L20 36" />
            <path d="M42 76 L22 74 L12 62" />
            <path d="M46 86 L30 96 L26 108" />
            <path d="M76 66 L94 52 L100 36" />
            <path d="M78 76 L98 74 L108 62" />
            <path d="M74 86 L90 96 L94 108" />
          </g>
          <circle cx="60" cy="76" r="22" fill={color} stroke={shade(color, 35)} strokeWidth="2" />
          <circle cx="60" cy="48" r="12" fill={tint(color, 15)} stroke={shade(color, 35)} strokeWidth="2" />
          {/* 注射針 */}
          <path d="M60 86 L60 104" stroke={tint(color, 60)} strokeWidth="4" strokeLinecap="round" />
          <path d="M60 100 L60 110" stroke={INK} strokeWidth="1.5" />
          <Eyes cx1={55} cx2={65} cy={47} r={3.5} angry />
        </g>
      );
    case 'golem':
      return (
        <g>
          <rect x="34" y="26" width="52" height="34" rx="4" fill={color} stroke={shade(color, 40)} strokeWidth="2" />
          <rect x="26" y="62" width="68" height="26" rx="4" fill={shade(color, 12)} stroke={shade(color, 40)} strokeWidth="2" />
          <rect x="32" y="90" width="24" height="14" rx="3" fill={shade(color, 20)} stroke={shade(color, 42)} strokeWidth="2" />
          <rect x="64" y="90" width="24" height="14" rx="3" fill={shade(color, 20)} stroke={shade(color, 42)} strokeWidth="2" />
          {/* 光る目 */}
          <rect x="44" y="38" width="10" height="8" fill="#E8C95A" />
          <rect x="66" y="38" width="10" height="8" fill="#E8C95A" />
          {/* ひび・苔 */}
          <path d="M40 62 L46 72 L40 80" stroke={shade(color, 40)} strokeWidth="1.6" fill="none" />
          <circle cx="80" cy="74" r="4" fill="#5E7A4A" opacity="0.7" />
          <circle cx="36" cy="30" r="3" fill="#5E7A4A" opacity="0.7" />
          <text x="48" y="80" fontSize="8" fontFamily="monospace" fill={tint(color, 50)} opacity="0.9">2009</text>
        </g>
      );
    case 'oni':
      return (
        <g>
          {/* 角 */}
          <path d="M40 30 L34 12 L50 24 Z" fill={tint(color, 30)} stroke={shade(color, 30)} strokeWidth="2" />
          <path d="M80 30 L86 12 L70 24 Z" fill={tint(color, 30)} stroke={shade(color, 30)} strokeWidth="2" />
          {/* 面 */}
          <path
            d="M60 20 C86 20 96 40 94 66 C92 90 80 104 60 104 C40 104 28 90 26 66 C24 40 34 20 60 20 Z"
            fill={color}
            stroke={shade(color, 40)}
            strokeWidth="2.5"
          />
          {/* 眉と目 */}
          <g stroke="#FBF7EE" strokeWidth="3" strokeLinecap="round">
            <line x1="38" y1="48" x2="52" y2="54" />
            <line x1="82" y1="48" x2="68" y2="54" />
          </g>
          <ellipse cx="47" cy="62" rx="6" ry="7" fill="#FBF7EE" />
          <ellipse cx="73" cy="62" rx="6" ry="7" fill="#FBF7EE" />
          <circle cx="48" cy="63" r="3" fill={INK} />
          <circle cx="72" cy="63" r="3" fill={INK} />
          {/* 牙のある口 */}
          <path d="M42 82 Q60 92 78 82" stroke="#FBF7EE" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M48 83 L51 90 L55 84 Z" fill="#FBF7EE" />
          <path d="M72 83 L69 90 L65 84 Z" fill="#FBF7EE" />
        </g>
      );
  }
}

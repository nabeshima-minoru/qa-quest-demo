'use client';

import type { BossArchetype } from '@/types';

interface Props {
  archetype: BossArchetype;
  /** メインのテーマカラー */
  color: string;
  /** HP 比率（0.0〜1.0）。低いほど苦悶表情・色調が暗くなる */
  hpRatio: number;
  /** 直前の選択が hit したフラグ。trueの間 shake クラスを付与 */
  hit?: boolean;
  /** 撃破済み？ */
  defeated?: boolean;
  /** 撤退（時間切れ）？ */
  escaped?: boolean;
  size?: number;
}

/** SVG ベースのスタイライズドキャラクターポートレート */
export default function BossPortrait({
  archetype,
  color,
  hpRatio,
  hit,
  defeated,
  escaped,
  size = 220,
}: Props) {
  const eyebrow = hpRatio < 0.4 ? 'angry' : hpRatio < 0.75 ? 'tense' : 'normal';
  const mouth = defeated
    ? 'defeated'
    : escaped
      ? 'smirk'
      : hpRatio < 0.4
        ? 'gritted'
        : hpRatio < 0.75
          ? 'tense'
          : 'sneer';

  // hit/defeated アニメーション用クラス
  const animClass = defeated
    ? 'qa-boss-defeated'
    : hit
      ? 'qa-boss-hit'
      : 'qa-boss-idle';

  // 色：HP に応じて少しずつ暗く
  const tone = Math.max(0.55, hpRatio); // 0.55 ~ 1.0
  const skin = '#E8D6BE';
  const skinDark = '#C4AC91';
  const hair = darken(color, 0.4);
  const shirt = color;
  const shirtDark = darken(color, 0.25);

  return (
    <div
      className={`qa-boss-portrait ${animClass}`}
      style={{
        width: size,
        height: size,
        filter: defeated ? 'grayscale(0.7) brightness(0.85)' : `brightness(${0.85 + 0.15 * tone})`,
      }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
        <defs>
          <radialGradient id={`bg-${archetype}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={lighten(color, 0.2)} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id={`shirt-${archetype}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shirt} />
            <stop offset="100%" stopColor={shirtDark} />
          </linearGradient>
        </defs>

        {/* Background hex / circle */}
        <circle cx="100" cy="100" r="98" fill={`url(#bg-${archetype})`} stroke={color} strokeOpacity="0.5" strokeWidth="2" />

        {/* Body / shoulders */}
        <Body archetype={archetype} shirt={`url(#shirt-${archetype})`} accent={shirtDark} />

        {/* Neck */}
        <rect x="86" y="124" width="28" height="16" rx="4" fill={skinDark} />

        {/* Head */}
        <ellipse cx="100" cy="93" rx="38" ry="46" fill={skin} stroke={skinDark} strokeWidth="1.2" />

        {/* Ears */}
        <ellipse cx="62" cy="95" rx="6" ry="9" fill={skin} stroke={skinDark} strokeWidth="0.8" />
        <ellipse cx="138" cy="95" rx="6" ry="9" fill={skin} stroke={skinDark} strokeWidth="0.8" />

        {/* Hair */}
        <Hair archetype={archetype} color={hair} />

        {/* Eyebrows */}
        <Eyebrows mood={eyebrow} color={hair} />

        {/* Eyes */}
        <Eyes archetype={archetype} defeated={defeated} />

        {/* Mouth */}
        <Mouth mood={mouth} />

        {/* Archetype-specific accessories */}
        <Accessories archetype={archetype} color={color} />

        {/* Defeated overlay */}
        {defeated && (
          <>
            <line x1="80" y1="80" x2="92" y2="92" stroke="#444" strokeWidth="3" strokeLinecap="round" />
            <line x1="92" y1="80" x2="80" y2="92" stroke="#444" strokeWidth="3" strokeLinecap="round" />
            <line x1="108" y1="80" x2="120" y2="92" stroke="#444" strokeWidth="3" strokeLinecap="round" />
            <line x1="120" y1="80" x2="108" y2="92" stroke="#444" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

/*──────────────────── parts ────────────────────*/

function Body({
  archetype,
  shirt,
  accent,
}: {
  archetype: BossArchetype;
  shirt: string;
  accent: string;
}) {
  if (archetype === 'dev_lead') {
    // パーカー
    return (
      <g>
        <path
          d="M40 200 Q40 150 100 145 Q160 150 160 200 Z"
          fill={shirt}
        />
        {/* hood lines */}
        <path d="M70 165 L75 195" stroke={accent} strokeWidth="2" fill="none" />
        <path d="M130 165 L125 195" stroke={accent} strokeWidth="2" fill="none" />
      </g>
    );
  }
  if (archetype === 'backend_lead') {
    // 襟付きシャツ
    return (
      <g>
        <path d="M40 200 Q40 145 100 140 Q160 145 160 200 Z" fill={shirt} />
        {/* collar V */}
        <polygon points="100,140 88,160 100,170 112,160" fill="#FAF5E8" />
        <line x1="88" y1="160" x2="100" y2="155" stroke={accent} strokeWidth="1.2" />
        <line x1="112" y1="160" x2="100" y2="155" stroke={accent} strokeWidth="1.2" />
        {/* tie */}
        <polygon points="100,160 96,170 100,200 104,170" fill={accent} />
      </g>
    );
  }
  if (archetype === 'product_mgr') {
    // ブレザー
    return (
      <g>
        <path d="M40 200 Q40 150 100 140 Q160 150 160 200 Z" fill={shirt} />
        {/* lapels */}
        <polygon points="100,140 75,200 90,200 100,160" fill={accent} />
        <polygon points="100,140 125,200 110,200 100,160" fill={accent} />
        {/* inner shirt */}
        <polygon points="100,140 95,200 105,200" fill="#FFFFFF" />
      </g>
    );
  }
  // cto: 黒スーツ + 細ストライプ風
  return (
    <g>
      <path d="M38 200 Q38 145 100 138 Q162 145 162 200 Z" fill={shirt} />
      <line x1="70" y1="180" x2="78" y2="200" stroke={accent} strokeWidth="1" opacity="0.6" />
      <line x1="120" y1="180" x2="128" y2="200" stroke={accent} strokeWidth="1" opacity="0.6" />
      {/* lapels */}
      <polygon points="100,138 75,200 92,200 100,160" fill={accent} opacity="0.8" />
      <polygon points="100,138 125,200 108,200 100,160" fill={accent} opacity="0.8" />
      <polygon points="100,138 94,200 106,200" fill="#0E0E0E" />
      {/* tie */}
      <polygon points="100,162 95,175 100,200 105,175" fill="#9C4040" />
    </g>
  );
}

function Hair({ archetype, color }: { archetype: BossArchetype; color: string }) {
  switch (archetype) {
    case 'dev_lead':
      // ぼさっとした髪 + 前髪を片側に流す
      return (
        <g>
          <path
            d="M62 75 Q60 50 100 47 Q140 50 138 78 Q132 60 100 58 Q72 60 62 75 Z"
            fill={color}
          />
          {/* スラっと流れる前髪 */}
          <path
            d="M75 60 Q90 50 120 55 Q135 60 138 70 Q120 65 100 65 Q85 67 75 75 Z"
            fill={color}
          />
        </g>
      );
    case 'backend_lead':
      // 七三、白髪混じり風
      return (
        <g>
          <path
            d="M64 80 Q60 55 100 49 Q140 55 136 80 Q132 62 100 60 Q72 64 64 80 Z"
            fill={color}
          />
          <path
            d="M90 60 L110 75 L100 60 Z"
            fill={color}
          />
          <line x1="85" y1="65" x2="115" y2="62" stroke="#9C8C7C" strokeWidth="0.8" opacity="0.7" />
          <line x1="83" y1="72" x2="115" y2="70" stroke="#9C8C7C" strokeWidth="0.6" opacity="0.6" />
        </g>
      );
    case 'product_mgr':
      // ボブ + サイドの揃った髪
      return (
        <g>
          <path
            d="M58 100 Q58 50 100 47 Q142 50 142 100 Q142 80 138 75 Q132 56 100 56 Q68 56 62 75 Q58 80 58 100 Z"
            fill={color}
          />
          {/* 前髪 */}
          <path
            d="M70 65 Q90 55 130 60 Q138 64 138 76 Q120 64 100 65 Q80 66 70 75 Z"
            fill={color}
          />
        </g>
      );
    case 'cto':
      // オールバック、白髪混じり
      return (
        <g>
          <path
            d="M62 80 Q58 50 100 47 Q142 50 138 80 Q130 62 100 60 Q70 62 62 80 Z"
            fill={color}
          />
          {/* sleek lines */}
          <path d="M70 70 Q90 62 130 65" stroke="#FAF5E8" strokeWidth="0.6" opacity="0.5" fill="none" />
          <path d="M70 75 Q90 70 130 71" stroke="#FAF5E8" strokeWidth="0.5" opacity="0.4" fill="none" />
        </g>
      );
  }
}

function Eyebrows({ mood, color }: { mood: 'normal' | 'tense' | 'angry'; color: string }) {
  if (mood === 'angry') {
    return (
      <g stroke={color} strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="76" y1="83" x2="92" y2="88" />
        <line x1="124" y1="83" x2="108" y2="88" />
      </g>
    );
  }
  if (mood === 'tense') {
    return (
      <g stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="77" y1="84" x2="92" y2="84" />
        <line x1="123" y1="84" x2="108" y2="84" />
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none">
      <path d="M77 84 Q84 81 92 84" />
      <path d="M123 84 Q116 81 108 84" />
    </g>
  );
}

function Eyes({ archetype, defeated }: { archetype: BossArchetype; defeated?: boolean }) {
  if (defeated) {
    // X X
    return (
      <g stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="80" y1="96" x2="90" y2="106" />
        <line x1="90" y1="96" x2="80" y2="106" />
        <line x1="110" y1="96" x2="120" y2="106" />
        <line x1="120" y1="96" x2="110" y2="106" />
      </g>
    );
  }
  // PMの女性はもう少し丸み、CTOは鋭い
  const ry = archetype === 'product_mgr' ? 4 : archetype === 'cto' ? 2.5 : 3.5;
  return (
    <g>
      <ellipse cx="85" cy="100" rx="3.5" ry={ry} fill="#2A2520" />
      <ellipse cx="115" cy="100" rx="3.5" ry={ry} fill="#2A2520" />
      {/* highlight */}
      <circle cx="86.5" cy="98.5" r="0.9" fill="#FFFFFF" />
      <circle cx="116.5" cy="98.5" r="0.9" fill="#FFFFFF" />
    </g>
  );
}

function Mouth({ mood }: { mood: 'normal' | 'sneer' | 'tense' | 'gritted' | 'defeated' | 'smirk' }) {
  switch (mood) {
    case 'sneer':
      return (
        <path
          d="M88 117 Q100 122 112 116"
          stroke="#5C3D2E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'tense':
      return (
        <line x1="88" y1="118" x2="112" y2="118" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" />
      );
    case 'gritted':
      return (
        <g>
          <path
            d="M86 118 Q100 124 114 118"
            stroke="#5C3D2E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* gritted teeth */}
          <line x1="90" y1="120" x2="90" y2="122.5" stroke="#5C3D2E" strokeWidth="1" />
          <line x1="95" y1="120.5" x2="95" y2="123" stroke="#5C3D2E" strokeWidth="1" />
          <line x1="100" y1="121" x2="100" y2="123.5" stroke="#5C3D2E" strokeWidth="1" />
          <line x1="105" y1="120.5" x2="105" y2="123" stroke="#5C3D2E" strokeWidth="1" />
          <line x1="110" y1="120" x2="110" y2="122.5" stroke="#5C3D2E" strokeWidth="1" />
        </g>
      );
    case 'defeated':
      return (
        <path
          d="M88 120 Q100 113 112 120"
          stroke="#5C3D2E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'smirk':
      return (
        <path
          d="M88 117 L112 113"
          stroke="#5C3D2E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    default:
      return (
        <line x1="92" y1="118" x2="108" y2="118" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" />
      );
  }
}

function Accessories({ archetype, color }: { archetype: BossArchetype; color: string }) {
  if (archetype === 'dev_lead') {
    // ヘッドホン
    return (
      <g stroke="#2A2520" strokeWidth="2.5" fill="none">
        <path d="M62 92 Q62 60 100 56 Q138 60 138 92" />
        <rect x="56" y="88" width="10" height="20" rx="4" fill="#2A2520" />
        <rect x="134" y="88" width="10" height="20" rx="4" fill="#2A2520" />
      </g>
    );
  }
  if (archetype === 'backend_lead') {
    // 角ばった眼鏡
    return (
      <g stroke="#2A2520" strokeWidth="2" fill="none">
        <rect x="72" y="92" width="22" height="14" rx="2" />
        <rect x="106" y="92" width="22" height="14" rx="2" />
        <line x1="94" y1="99" x2="106" y2="99" />
      </g>
    );
  }
  if (archetype === 'product_mgr') {
    // イヤリング + 細い眼鏡
    return (
      <g>
        <circle cx="62" cy="106" r="2.5" fill={lighten(color, 0.2)} />
        <circle cx="138" cy="106" r="2.5" fill={lighten(color, 0.2)} />
        <g stroke="#2A2520" strokeWidth="1.4" fill="none">
          <ellipse cx="85" cy="100" rx="10" ry="6" />
          <ellipse cx="115" cy="100" rx="10" ry="6" />
          <line x1="95" y1="100" x2="105" y2="100" />
        </g>
      </g>
    );
  }
  // cto: 細いインテリ眼鏡 + 髪のオールバック仕上げ
  return (
    <g stroke="#2A2520" strokeWidth="1.5" fill="none">
      <ellipse cx="85" cy="100" rx="11" ry="5.5" />
      <ellipse cx="115" cy="100" rx="11" ry="5.5" />
      <line x1="96" y1="100" x2="104" y2="100" />
    </g>
  );
}

/*──────────────────── color utils ────────────────────*/

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}
function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}
function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}

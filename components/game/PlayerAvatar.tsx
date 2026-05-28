'use client';

import type { RoleId } from '@/types';

interface Props {
  role: RoleId;
  size?: number;
}

/**
 * プレイヤー（テスター主人公）の役職別アバター。
 * 同一人物の成長として、髪型と服装を段階的にフォーマル化。
 * 顔立ちは全ロール共通で違和感を防ぐ。
 */
export default function PlayerAvatar({ role, size = 56 }: Props) {
  const cfg = ROLE_CONFIG[role];

  // 共通の肌色・髪色
  const skin = '#E8D2B5';
  const skinDark = '#C6AC8C';
  const hair = '#3D2A1D';
  const hairLight = '#5B4030';

  return (
    <div
      style={{ width: size, height: size }}
      className="shrink-0"
      aria-label={`${role} avatar`}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id={`pa-bg-${role}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={cfg.bg} stopOpacity="0.5" />
            <stop offset="100%" stopColor={cfg.bg} stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id={`pa-cloth-${role}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.outfit} />
            <stop offset="100%" stopColor={darken(cfg.outfit, 0.22)} />
          </linearGradient>
        </defs>

        {/* Background */}
        <circle
          cx="100"
          cy="100"
          r="98"
          fill={`url(#pa-bg-${role})`}
          stroke={cfg.bg}
          strokeOpacity="0.55"
          strokeWidth="2"
        />

        {/* Body / shoulders（役職別） */}
        <Body clothFill={`url(#pa-cloth-${role})`} accent={darken(cfg.outfit, 0.3)} cfg={cfg} />

        {/* Neck */}
        <rect x="86" y="120" width="28" height="18" rx="4" fill={skinDark} />

        {/* Head */}
        <ellipse cx="100" cy="90" rx="38" ry="48" fill={skin} stroke={skinDark} strokeWidth="1.2" />

        {/* Ears */}
        <ellipse cx="62" cy="93" rx="6" ry="9" fill={skin} stroke={skinDark} strokeWidth="0.8" />
        <ellipse cx="138" cy="93" rx="6" ry="9" fill={skin} stroke={skinDark} strokeWidth="0.8" />

        {/* Hair（役職別に段々整っていく） */}
        <Hair role={role} color={hair} highlight={hairLight} />

        {/* Eyebrows — 役職が上がるほど落ち着いた角度 */}
        <Eyebrows role={role} color={hair} />

        {/* Eyes */}
        <g>
          <ellipse cx="86" cy="98" rx="3.2" ry="3.6" fill="#2A2520" />
          <ellipse cx="114" cy="98" rx="3.2" ry="3.6" fill="#2A2520" />
          <circle cx="87" cy="96.5" r="0.9" fill="#FFFFFF" />
          <circle cx="115" cy="96.5" r="0.9" fill="#FFFFFF" />
        </g>

        {/* Mouth — 自信ある微笑 */}
        <Mouth role={role} />

        {/* Accessories — 眼鏡など */}
        {cfg.glasses && <Glasses />}

        {/* Role rank pip — 右下に星 / クラウンライクな印 */}
        <RankInsignia rank={cfg.rank} color={cfg.insignia} />
      </svg>
    </div>
  );
}

/*──────────────────── role config ────────────────────*/

interface RoleConfig {
  /** 背景の暈色 */
  bg: string;
  /** 服のメインカラー */
  outfit: string;
  /** 補助色（ネクタイ・襟・差し色） */
  accent: string;
  /** 服のタイプ */
  outfitType: 'tshirt' | 'polo' | 'shirt' | 'shirt_jacket' | 'suit' | 'premium_suit';
  /** 眼鏡を付けるか */
  glasses: boolean;
  /** 髪のスタイリッシュ度（0..1） */
  hairFormality: number;
  /** 右下に表示するランクピップの数（1〜6） */
  rank: number;
  /** ランクピップ色 */
  insignia: string;
}

const ROLE_CONFIG: Record<RoleId, RoleConfig> = {
  tester: {
    bg: '#5A7585', // slate
    outfit: '#6E8B5A', // sage Tシャツ
    accent: '#5A7585',
    outfitType: 'tshirt',
    glasses: false,
    hairFormality: 0.1,
    rank: 1,
    insignia: '#9C8456',
  },
  test_leader: {
    bg: '#6E8B5A', // sage
    outfit: '#4F6675', // navy polo
    accent: '#3D5161',
    outfitType: 'polo',
    glasses: false,
    hairFormality: 0.4,
    rank: 2,
    insignia: '#9C8456',
  },
  test_manager: {
    bg: '#9C8456', // brass
    outfit: '#3D5161', // dark navy shirt
    accent: '#A85050', // tie
    outfitType: 'shirt',
    glasses: true,
    hairFormality: 0.65,
    rank: 3,
    insignia: '#9C8456',
  },
  consultant: {
    bg: '#76496A', // wine plum
    outfit: '#2E3A45', // dark blazer
    accent: '#B85C5C', // bengara pocket detail
    outfitType: 'shirt_jacket',
    glasses: true,
    hairFormality: 0.8,
    rank: 4,
    insignia: '#9C8456',
  },
  director: {
    bg: '#8E5638', // terracotta
    outfit: '#1E232A', // dark suit
    accent: '#9C4040', // bengara tie
    outfitType: 'suit',
    glasses: false,
    hairFormality: 0.9,
    rank: 5,
    insignia: '#B85C5C',
  },
  ceo: {
    bg: '#B85C5C', // bengara
    outfit: '#0E1116', // ultra dark suit
    accent: '#9C8456', // brass accents
    outfitType: 'premium_suit',
    glasses: false,
    hairFormality: 1.0,
    rank: 6,
    insignia: '#9C8456',
  },
};

/*──────────────────── parts ────────────────────*/

function Body({
  clothFill,
  accent,
  cfg,
}: {
  clothFill: string;
  accent: string;
  cfg: RoleConfig;
}) {
  switch (cfg.outfitType) {
    case 'tshirt':
      // 普通のTシャツ襟ぐり
      return (
        <g>
          <path d="M40 200 Q40 148 100 140 Q160 148 160 200 Z" fill={clothFill} />
          {/* 襟ぐり */}
          <ellipse cx="100" cy="140" rx="12" ry="6" fill="#C6AC8C" />
        </g>
      );
    case 'polo':
      // ポロシャツ襟
      return (
        <g>
          <path d="M40 200 Q40 145 100 138 Q160 145 160 200 Z" fill={clothFill} />
          <polygon points="100,138 88,158 100,168 112,158" fill="#FAF5E8" />
          <line x1="88" y1="158" x2="100" y2="153" stroke={accent} strokeWidth="1.2" />
          <line x1="112" y1="158" x2="100" y2="153" stroke={accent} strokeWidth="1.2" />
          {/* placket button */}
          <circle cx="100" cy="170" r="1.4" fill={accent} />
        </g>
      );
    case 'shirt':
      // 襟付きシャツ + ネクタイ
      return (
        <g>
          <path d="M40 200 Q40 142 100 136 Q160 142 160 200 Z" fill={clothFill} />
          <polygon points="100,136 86,158 100,168 114,158" fill="#FAF5E8" />
          <line x1="86" y1="158" x2="100" y2="152" stroke={accent} strokeWidth="1.2" />
          <line x1="114" y1="158" x2="100" y2="152" stroke={accent} strokeWidth="1.2" />
          {/* tie */}
          <polygon points="100,158 95,170 100,200 105,170" fill={cfg.accent} />
        </g>
      );
    case 'shirt_jacket':
      // シャツ + ジャケット
      return (
        <g>
          <path d="M40 200 Q40 145 100 138 Q160 145 160 200 Z" fill={clothFill} />
          {/* lapels */}
          <polygon points="100,138 76,200 92,200 100,160" fill={darken(cfg.outfit, 0.15)} />
          <polygon points="100,138 124,200 108,200 100,160" fill={darken(cfg.outfit, 0.15)} />
          {/* shirt + tieless */}
          <polygon points="100,138 95,200 105,200" fill="#FAF5E8" />
          {/* pocket square */}
          <rect x="75" y="158" width="8" height="6" fill={cfg.accent} />
        </g>
      );
    case 'suit':
      // フォーマルスーツ + 鋭めラペル
      return (
        <g>
          <path d="M38 200 Q38 143 100 136 Q162 143 162 200 Z" fill={clothFill} />
          <polygon points="100,136 73,200 90,200 100,158" fill={darken(cfg.outfit, 0.2)} />
          <polygon points="100,136 127,200 110,200 100,158" fill={darken(cfg.outfit, 0.2)} />
          <polygon points="100,136 94,200 106,200" fill="#0F1218" />
          {/* tie */}
          <polygon points="100,160 95,175 100,200 105,175" fill={cfg.accent} />
          {/* lapel button */}
          <circle cx="118" cy="178" r="1" fill={lighten(cfg.outfit, 0.3)} />
        </g>
      );
    case 'premium_suit':
      // 高級スーツ + ポケットチーフ + ピン
      return (
        <g>
          <path d="M36 200 Q36 142 100 134 Q164 142 164 200 Z" fill={clothFill} />
          {/* subtle pinstripe hint */}
          <line x1="68" y1="172" x2="74" y2="200" stroke={lighten(cfg.outfit, 0.15)} strokeWidth="0.8" opacity="0.4" />
          <line x1="126" y1="172" x2="132" y2="200" stroke={lighten(cfg.outfit, 0.15)} strokeWidth="0.8" opacity="0.4" />
          {/* lapels */}
          <polygon points="100,134 72,200 90,200 100,158" fill={lighten(cfg.outfit, 0.08)} />
          <polygon points="100,134 128,200 110,200 100,158" fill={lighten(cfg.outfit, 0.08)} />
          {/* shirt */}
          <polygon points="100,134 94,200 106,200" fill="#FAF5E8" />
          {/* tie */}
          <polygon points="100,160 94,175 100,200 106,175" fill={cfg.accent} />
          {/* pocket square triangle */}
          <polygon points="72,156 86,156 78,148" fill={cfg.accent} />
          {/* lapel pin (small star) */}
          <Star cx={118} cy={170} r={3} color={cfg.accent} />
        </g>
      );
  }
}

function Hair({
  role,
  color,
  highlight,
}: {
  role: RoleId;
  color: string;
  highlight: string;
}) {
  const formality = ROLE_CONFIG[role].hairFormality;
  // 全ロール共通の輪郭
  return (
    <g>
      {/* 後頭部 */}
      <path
        d="M60 78 Q58 50 100 46 Q142 50 140 78 Q132 60 100 58 Q70 60 60 78 Z"
        fill={color}
      />
      {/* 前髪：formality が高いほどきっちり横分け */}
      {formality < 0.3 && (
        // ふわっと自然な前髪
        <path
          d="M72 60 Q90 52 130 56 Q138 60 140 72 Q120 68 100 67 Q80 68 72 75 Z"
          fill={color}
        />
      )}
      {formality >= 0.3 && formality < 0.7 && (
        // ゆるい横分け
        <path
          d="M72 60 Q92 54 132 58 Q138 64 140 75 Q128 66 110 67 Q92 70 72 75 Z"
          fill={color}
        />
      )}
      {formality >= 0.7 && (
        // きっちり七三
        <g>
          <path
            d="M70 60 Q90 52 130 56 Q140 60 142 74 Q128 65 108 66 Q88 70 70 78 Z"
            fill={color}
          />
          <line x1="92" y1="58" x2="115" y2="73" stroke={highlight} strokeWidth="0.8" opacity="0.6" />
        </g>
      )}
      {/* CEO のみ：白髪混じり */}
      {role === 'ceo' && (
        <>
          <line x1="80" y1="68" x2="90" y2="64" stroke="#D6CCB9" strokeWidth="0.6" opacity="0.5" />
          <line x1="105" y1="62" x2="120" y2="65" stroke="#D6CCB9" strokeWidth="0.6" opacity="0.5" />
          <line x1="130" y1="70" x2="135" y2="74" stroke="#D6CCB9" strokeWidth="0.6" opacity="0.5" />
        </>
      )}
    </g>
  );
}

function Eyebrows({ role, color }: { role: RoleId; color: string }) {
  const formality = ROLE_CONFIG[role].hairFormality;
  // 上位職は水平気味で落ち着いた印象
  if (formality >= 0.7) {
    return (
      <g stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none">
        <line x1="78" y1="86" x2="92" y2="86" />
        <line x1="108" y1="86" x2="122" y2="86" />
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none">
      <path d="M78 87 Q85 84 92 87" />
      <path d="M122 87 Q115 84 108 87" />
    </g>
  );
}

function Mouth({ role }: { role: RoleId }) {
  const formality = ROLE_CONFIG[role].hairFormality;
  if (formality < 0.4) {
    // 親しみやすい微笑
    return (
      <path
        d="M90 116 Q100 122 110 116"
        stroke="#5C3D2E"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (formality < 0.85) {
    // 落ち着いた微笑
    return (
      <path
        d="M92 117 Q100 121 108 117"
        stroke="#5C3D2E"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  // 役員：静かな口元
  return (
    <line
      x1="92"
      y1="118"
      x2="108"
      y2="118"
      stroke="#5C3D2E"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  );
}

function Glasses() {
  return (
    <g stroke="#2A2520" strokeWidth="1.6" fill="none">
      <ellipse cx="86" cy="98" rx="9" ry="6" />
      <ellipse cx="114" cy="98" rx="9" ry="6" />
      <line x1="95" y1="98" x2="105" y2="98" />
    </g>
  );
}

function RankInsignia({ rank, color }: { rank: number; color: string }) {
  // 右下にランクの数だけ小さな星を並べる（最大 6 個）
  const pips = Math.min(6, Math.max(1, rank));
  const items = [];
  const startX = 154;
  const y = 178;
  const step = 7;
  for (let i = 0; i < pips; i++) {
    items.push(<Star key={i} cx={startX + i * step - (pips - 1) * step} cy={y} r={2.4} color={color} />);
  }
  return <g>{items}</g>;
}

function Star({
  cx,
  cy,
  r,
  color,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
}) {
  // 5-point star
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return <polygon points={points.join(' ')} fill={color} />;
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

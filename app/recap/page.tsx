'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/common/BaseButton';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import { BALANCE, STAT_COLORS, STAT_LABELS } from '@/lib/constants';
import { useGameStore } from '@/lib/gameStore';
import type { ChoiceQuality, StatKey, TurnLog } from '@/types';

const QUALITY_META: Record<
  ChoiceQuality,
  { label: string; color: string; order: number }
> = {
  optimal:    { label: '最適解', color: 'var(--brass)',   order: 0 },
  good:       { label: '良判断', color: 'var(--success)', order: 1 },
  average:    { label: '平均',   color: 'var(--text-2)',  order: 2 },
  suboptimal: { label: '準最適', color: 'var(--warn)',    order: 3 },
  poor:       { label: '悪手',   color: 'var(--danger)',  order: 4 },
};

interface Act {
  name: string;
  subtitle: string;
  color: string;
}

const ACT_BY_MILESTONE: Record<number, Act> = {
  10: { name: '第一幕', subtitle: '見習いの一歩',     color: 'var(--st-comm)' },
  20: { name: '第二幕', subtitle: '現場の試練',       color: 'var(--brass)' },
  30: { name: '第三幕', subtitle: '信頼の獲得',       color: 'var(--st-mgmt)' },
  40: { name: '最終幕前', subtitle: 'プロの覚悟',     color: 'var(--accent)' },
};

type Tier = 'excellent' | 'good' | 'mixed' | 'rough';

const COMMENTARY: Record<number, Record<Tier, string>> = {
  10: {
    excellent:
      '見習いとして卓越したスタート。早くも頭角を現し、周囲の評価も上向き始めている。この調子で経験を重ねよう。',
    good:
      '堅実な滑り出し。基本に忠実な判断が見え始めた。次は一歩踏み込んだ提案にも挑戦してみたい。',
    mixed:
      '試行錯誤の 10 ターンだった。失敗から得た気付きは大きい。判断の根拠を意識すると次が変わる。',
    rough:
      'つまずきの多い船出だが、テスターという職業は誰もが躓きながら育つもの。焦らず、振り返りを丁寧に。',
  },
  20: {
    excellent:
      '中堅エンジニアとしての判断力が際立つ期間だった。チームから一目置かれる存在になりつつある。',
    good:
      '安定した成長軌道。プロとしての土台が確実に固まってきた。次は周囲を巻き込む動きを意識しよう。',
    mixed:
      '判断の波が目立つ。経験豊富な先輩に意図を相談する習慣を持つと、選択の精度が上がるはず。',
    rough:
      '苦戦が続いている。だが、ここで立ち止まり自分の強みを見極めれば、後半で巻き返せる余地は十分ある。',
  },
  30: {
    excellent:
      'リーダーの素質が開花してきた。技術判断だけでなく、人を導く視点も備わってきた。',
    good:
      '頼られる場面が増え始めた。実力に応じて、責任ある役割を担う準備を始めよう。',
    mixed:
      '実力はあるが、決断にムラがある。場数を積み、判断軸を言語化する時期かもしれない。',
    rough:
      'プレッシャーが顕在化する局面。だが、ここで踏ん張れば見える景色は必ず変わる。',
  },
  40: {
    excellent:
      'プロフェッショナルの覚悟が確固たるものに。最終幕の 10 ターンも大きな成果が期待できる。',
    good:
      '安定した実力。あと 10 ターンで未来が決まる。最後まで集中を切らさず仕上げよう。',
    mixed:
      '最後の 10 ターンでまだ巻き返せる余地は十分ある。優先順位を絞って臨もう。',
    rough:
      '評価は厳しい局面に立たされている。それでも、最後の追い上げを諦めるには早すぎる。',
  },
};

function tierFromOptimal(optimal: number): Tier {
  if (optimal >= 5) return 'excellent';
  if (optimal >= 3) return 'good';
  if (optimal >= 1) return 'mixed';
  return 'rough';
}

export default function RecapPage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const pendingRecap = useGameStore((s) => s.pendingRecap);
  const clearRecap = useGameStore((s) => s.clearRecap);
  const actionLog = useGameStore((s) => s.actionLog);
  const stats = useGameStore((s) => s.stats);
  const wallet = useGameStore((s) => s.wallet);
  const level = useGameStore((s) => s.level);
  const currentRole = useGameStore((s) => s.currentRole);
  const status = useGameStore((s) => s.status);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 未設定なら /game へ戻す
  useEffect(() => {
    if (pendingRecap === null && status !== 'idle') {
      router.replace('/game');
    }
    if (status === 'idle') {
      router.replace('/');
    }
  }, [pendingRecap, status, router]);

  const milestone = pendingRecap; // 10|20|30|40
  const act = milestone ? ACT_BY_MILESTONE[milestone] : null;

  // 直近10ターンの行動ログ
  const period = useMemo<TurnLog[]>(() => actionLog.slice(-10), [actionLog]);

  // 品質分布
  const qualityCounts = useMemo(() => {
    const init: Record<ChoiceQuality, number> = {
      optimal: 0,
      good: 0,
      average: 0,
      suboptimal: 0,
      poor: 0,
    };
    period.forEach((l) => {
      init[l.quality] += 1;
    });
    return init;
  }, [period]);

  // 期間内の成長量
  const periodDelta = useMemo(() => {
    const stat: Record<StatKey, number> = {
      tech: 0,
      comm: 0,
      analysis: 0,
      mgmt: 0,
      ai: 0,
    };
    let walletDelta = 0;
    let expGained = 0;
    period.forEach((l) => {
      const e = l.effects;
      if (typeof e.tech === 'number') stat.tech += e.tech;
      if (typeof e.comm === 'number') stat.comm += e.comm;
      if (typeof e.analysis === 'number') stat.analysis += e.analysis;
      if (typeof e.mgmt === 'number') stat.mgmt += e.mgmt;
      if (typeof e.ai === 'number') stat.ai += e.ai;
      if (typeof e.wallet === 'number') walletDelta += e.wallet;
      expGained += l.expGain;
    });
    return { stat, walletDelta, expGained };
  }, [period]);

  // ハイライト / 反省イベント
  const highlight = useMemo(
    () => period.find((l) => l.quality === 'optimal') ?? null,
    [period]
  );
  const lesson = useMemo(
    () =>
      [...period]
        .reverse()
        .find((l) => l.quality === 'poor' || l.quality === 'suboptimal') ?? null,
    [period]
  );

  if (!milestone || !act) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">読み込み中...</p>
      </main>
    );
  }

  const tier = tierFromOptimal(qualityCounts.optimal);
  const commentary = COMMENTARY[milestone][tier];
  const roleName =
    BALANCE.ROLES.find((r) => r.id === currentRole)?.name ?? 'テスター';
  const total = period.length || 1;

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-2 mb-8">
        <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          Interim Recap · Turn {milestone} / {BALANCE.MAX_TURNS}
        </p>
        <h1 className="serif text-3xl text-[var(--cream)]">中間総括</h1>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mono text-[11px] uppercase tracking-widest rounded-[var(--r-sm)]"
          style={{
            color: act.color,
            background: 'var(--card2)',
            border: `1px solid ${act.color}`,
          }}
        >
          <span>{act.name}</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span style={{ color: 'var(--text)' }}>{act.subtitle}</span>
        </div>
      </header>

      {/* Quick Status */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatusTile label="Level" value={String(level)} />
        <StatusTile label="Role" value={roleName} />
        <StatusTile
          label="Wallet"
          value={`¥${wallet.toLocaleString('ja-JP')}`}
        />
        <StatusTile label="Total EXP" value={String(actionLog.reduce((a, b) => a + b.expGain, 0))} />
      </section>

      {/* Choice quality distribution */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5 space-y-4 mb-6">
        <header className="flex items-baseline justify-between">
          <h2 className="serif text-base text-[var(--cream)]">
            今期の選択（Turn {milestone - 9}〜{milestone}）
          </h2>
          <span className="mono text-[10px] text-[var(--text-3)] uppercase tracking-widest">
            {period.length} actions
          </span>
        </header>

        {/* Stacked bar */}
        <div className="flex h-3 rounded-[var(--r-sm)] overflow-hidden border border-[var(--edge)]">
          {(['optimal', 'good', 'average', 'suboptimal', 'poor'] as ChoiceQuality[]).map(
            (q) => {
              const w = (qualityCounts[q] / total) * 100;
              if (w === 0) return null;
              return (
                <div
                  key={q}
                  style={{
                    width: `${w}%`,
                    background: QUALITY_META[q].color,
                  }}
                  title={`${QUALITY_META[q].label} × ${qualityCounts[q]}`}
                />
              );
            }
          )}
        </div>

        {/* Legend */}
        <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          {(['optimal', 'good', 'average', 'suboptimal', 'poor'] as ChoiceQuality[]).map(
            (q) => (
              <li key={q} className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: QUALITY_META[q].color }}
                />
                <span className="text-[var(--text-2)]">
                  {QUALITY_META[q].label}
                </span>
                <span className="mono text-[var(--cream)] ml-auto">
                  {qualityCounts[q]}
                </span>
              </li>
            )
          )}
        </ul>
      </section>

      {/* Growth */}
      <section className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5 space-y-3 mb-6">
        <h2 className="serif text-base text-[var(--cream)]">今期の成長</h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {(Object.keys(periodDelta.stat) as StatKey[]).map((k) => (
            <div key={k}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[12px] text-[var(--text)]">
                  {STAT_LABELS[k]}
                </span>
                <span
                  className="mono text-[11px]"
                  style={{ color: STAT_COLORS[k] }}
                >
                  +{periodDelta.stat[k]}
                </span>
              </div>
              <BaseProgressBar
                value={stats[k]}
                max={BALANCE.STAT_CAP}
                color={STAT_COLORS[k]}
                height={4}
              />
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-[var(--edge)] grid grid-cols-2 gap-3 text-[12px]">
          <div className="flex items-baseline justify-between">
            <span className="text-[var(--text-2)]">獲得 EXP</span>
            <span className="mono text-[var(--brass)]">
              +{periodDelta.expGained}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[var(--text-2)]">資金推移</span>
            <span
              className="mono"
              style={{
                color:
                  periodDelta.walletDelta >= 0
                    ? 'var(--success)'
                    : 'var(--danger)',
              }}
            >
              {periodDelta.walletDelta >= 0 ? '+' : ''}
              ¥{periodDelta.walletDelta.toLocaleString('ja-JP')}
            </span>
          </div>
        </div>
      </section>

      {/* Highlights */}
      {(highlight || lesson) && (
        <section className="grid md:grid-cols-2 gap-4 mb-6">
          {highlight && (
            <HighlightCard
              icon="◎"
              title="ハイライト"
              color="var(--brass)"
              entry={highlight}
            />
          )}
          {lesson && (
            <HighlightCard
              icon="※"
              title="次への学び"
              color="var(--warn)"
              entry={lesson}
            />
          )}
        </section>
      )}

      {/* Commentary */}
      <section
        className="border rounded-[var(--r)] p-6 mb-8"
        style={{
          background: 'var(--card2)',
          borderColor: act.color,
        }}
      >
        <p
          className="mono text-[10px] uppercase tracking-[0.3em] mb-3"
          style={{ color: act.color }}
        >
          Mentor&rsquo;s note · 総括
        </p>
        <p className="serif text-[15px] text-[var(--cream)] leading-relaxed">
          {commentary}
        </p>
      </section>

      {/* CTA */}
      <div className="text-center">
        <BaseButton
          size="lg"
          onClick={() => {
            clearRecap();
            router.push('/game');
          }}
        >
          次のターンへ進む
        </BaseButton>
        <p className="mt-3 text-[11px] text-[var(--text-3)]">
          Turn {milestone + 1} から再開します
        </p>
      </div>
    </main>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r-sm)] p-3 text-center">
      <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">
        {label}
      </div>
      <div className="serif text-base text-[var(--cream)] truncate">{value}</div>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  color,
  entry,
}: {
  icon: string;
  title: string;
  color: string;
  entry: TurnLog;
}) {
  return (
    <div
      className="border rounded-[var(--r)] p-4 space-y-2"
      style={{
        background: 'var(--card)',
        borderColor: color,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="serif text-lg" style={{ color }}>
          {icon}
        </span>
        <span
          className="mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color }}
        >
          {title} · T{entry.turn}
        </span>
      </div>
      <p className="text-[13px] text-[var(--cream)] serif">{entry.eventTitle}</p>
      <p className="text-[12px] text-[var(--text-2)] leading-relaxed">
        選択 {entry.choiceKey}：{entry.choiceText}
      </p>
      <div className="flex items-center justify-between text-[11px] pt-1">
        <span className="mono" style={{ color: QUALITY_META[entry.quality].color }}>
          {QUALITY_META[entry.quality].label}
        </span>
        <span className="mono text-[var(--brass)]">+{entry.expGain} EXP</span>
      </div>
    </div>
  );
}

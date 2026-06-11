'use client';

// QA Quest — 最終戦績

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/common/BaseButton';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import { useRunStore } from '@/lib/runStore';
import { findArchetype } from '@/data/perks';
import { findPerk } from '@/data/perks';
import { findCard } from '@/data/cards';

const RANK_COMMENT: Record<string, string> = {
  S: '伝説のバグハンター。その名はリリースノートに刻まれる。',
  A: '頼れるシニアQA。大障害も冷静に鎮火した。',
  B: '堅実な仕事ぶり。現場の信頼は厚い。',
  C: 'バグとの戦いはこれから。基礎は身についた。',
  D: '尊い犠牲だった。次のランで雪辱を。',
};

const RANK_COLOR: Record<string, string> = {
  S: 'var(--brass)',
  A: 'var(--accent)',
  B: 'var(--st-comm)',
  C: 'var(--text-2)',
  D: 'var(--text-3)',
};

export default function ResultPage() {
  const router = useRouter();
  const hydrate = useRunStore((s) => s.hydrate);
  const reset = useRunStore((s) => s.reset);
  const status = useRunStore((s) => s.status);
  const score = useRunStore((s) => s.score);
  const stats = useRunStore((s) => s.stats);
  const hp = useRunStore((s) => s.hp);
  const maxHp = useRunStore((s) => s.maxHp);
  const act = useRunStore((s) => s.act);
  const deck = useRunStore((s) => s.deck);
  const perkIds = useRunStore((s) => s.perkIds);
  const archetypeId = useRunStore((s) => s.archetypeId);

  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'ng'>('idle');

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (status === 'idle') router.replace('/');
    else if (status === 'run') router.replace('/run');
  }, [ready, status, router]);

  if (!ready || status !== 'result' || !score) return null;

  const arch = findArchetype(archetypeId ?? '');

  const handleCopy = async () => {
    const lines = [
      `QA Quest 戦績 — ${score.victory ? '完走' : `第${act}幕で力尽きる`}`,
      `RANK ${score.rank} / SCORE ${score.finalScore}`,
      `スタイル: ${arch?.name ?? '—'}`,
      `退治したバグ ${stats.bugsSquashed} / 勝利 ${stats.battlesWon} 戦 / 総ダメージ ${stats.damageDealt}`,
      `踏破フロア ${stats.floorsClimbed} / デッキ ${deck.length} 枚`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied('ok');
    } catch {
      setCopied('ng');
    }
    setTimeout(() => setCopied('idle'), 2000);
  };

  const breakdown = [
    { label: '踏破', value: score.breakdown.progressScore, weight: 0.4 },
    { label: '生還メンタル', value: score.breakdown.hpScore, weight: 0.2 },
    { label: 'バグ退治', value: score.breakdown.huntScore, weight: 0.25 },
    { label: 'デッキ錬成', value: score.breakdown.deckScore, weight: 0.15 },
  ];

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <header className="text-center">
        <p className="mono text-[10px] tracking-[0.3em] text-[var(--text-3)] uppercase">
          Run Report
        </p>
        <h1 className="serif text-3xl text-[var(--cream)] mt-1">
          {score.victory ? 'リリース成功' : '燃え尽き'}
        </h1>
        <p className="text-[11px] text-[var(--text-2)] mt-1">
          {arch?.name ?? ''} · {score.victory ? '全 3 幕完走' : `第 ${act} 幕にて`}
        </p>
      </header>

      {/* ランク */}
      <section className="qa-overlay-in rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-6 text-center">
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className="mono text-[9px] tracking-widest text-[var(--text-3)] uppercase">Rank</p>
            <p className="serif text-7xl font-bold" style={{ color: RANK_COLOR[score.rank] }}>
              {score.rank}
            </p>
          </div>
          <div className="text-left">
            <p className="mono text-[9px] tracking-widest text-[var(--text-3)] uppercase">Score</p>
            <p className="mono text-4xl font-bold text-[var(--cream)]">
              {score.finalScore}
              <span className="text-sm text-[var(--text-3)]"> /100</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-2)] mt-4">{RANK_COMMENT[score.rank]}</p>
      </section>

      {/* 内訳 */}
      <section className="rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-5 space-y-3">
        <h2 className="mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-3)]">
          Score Breakdown
        </h2>
        {breakdown.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text)]">{b.label}</span>
              <span className="mono text-[var(--text-2)]">
                {b.value.toFixed(1)} × {b.weight}
              </span>
            </div>
            <BaseProgressBar value={b.value} max={100} color="var(--brass)" height={7} />
          </div>
        ))}
      </section>

      {/* 戦績 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="退治したバグ" value={`${stats.bugsSquashed} 匹`} />
        <StatCard label="勝利数" value={`${stats.battlesWon} 戦`} />
        <StatCard label="総ダメージ" value={`${stats.damageDealt}`} />
        <StatCard label="踏破フロア" value={`${stats.floorsClimbed}`} />
      </section>

      {/* 生還状態・パーク */}
      <section className="rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-5 space-y-3">
        <BaseProgressBar
          value={hp}
          max={maxHp}
          color={score.victory ? 'var(--success)' : 'var(--danger)'}
          height={9}
          showLabel
          label="最終メンタル"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {perkIds.map((id) => {
            const p = findPerk(id);
            return p ? (
              <span
                key={id}
                className="mono text-[10px] px-2 py-0.5 rounded-full border border-[var(--brass)] text-[var(--brass-d)] bg-[var(--brass-l)]"
              >
                {p.glyph} {p.name}
              </span>
            ) : null;
          })}
          {perkIds.length === 0 && (
            <span className="text-[10px] text-[var(--text-3)]">昇進歴なし</span>
          )}
        </div>
        <p className="mono text-[10px] text-[var(--text-3)]">
          最終デッキ {deck.length} 枚 —{' '}
          {deck
            .slice(0, 6)
            .map((c) => findCard(c.defId)?.glyph ?? '')
            .join('・')}
          {deck.length > 6 && ' …'}
        </p>
      </section>

      {/* アクション */}
      <section className="space-y-2.5 pt-1">
        <BaseButton fullWidth size="lg" onClick={handleCopy}>
          {copied === 'ok' ? 'コピーしました' : copied === 'ng' ? 'コピーできませんでした' : '戦績をコピー'}
        </BaseButton>
        <BaseButton
          fullWidth
          size="md"
          variant="secondary"
          onClick={() => {
            reset();
            router.push('/');
          }}
        >
          もう一度挑戦する
        </BaseButton>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] px-3 py-3 text-center">
      <p className="mono text-[9px] tracking-widest text-[var(--text-3)] uppercase">{label}</p>
      <p className="serif text-lg font-bold text-[var(--cream)] mt-1">{value}</p>
    </div>
  );
}

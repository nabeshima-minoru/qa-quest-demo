'use client';

// QA Quest — タイトル＋アーキタイプ選択

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import BaseButton from '@/components/common/BaseButton';
import { useRunStore } from '@/lib/runStore';
import { archetypes } from '@/data/perks';

export default function TitlePage() {
  const router = useRouter();
  const hydrate = useRunStore((s) => s.hydrate);
  const reset = useRunStore((s) => s.reset);
  const status = useRunStore((s) => s.status);
  const startRun = useRunStore((s) => s.startRun);
  const [ready, setReady] = useState(false);
  const [archetypeId, setArchetypeId] = useState(archetypes[0].id);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  const hasRun = ready && status === 'run';
  const hasResult = ready && status === 'result';

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <header className="space-y-3">
          <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
            QA Quest · Internal Demo
          </p>
          <h1 className="serif text-5xl text-[var(--cream)] leading-tight">
            デバッグ・
            <br className="sm:hidden" />
            ローグライク
          </h1>
          <p className="text-[var(--text-2)] text-sm leading-relaxed pt-2">
            QA 技法のカードを集め、デッキを鍛え、
            <br />
            リリース前夜に巣食うバグの妖怪たちを退治する。
          </p>
        </header>

        {hasRun ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <BaseButton fullWidth size="lg" onClick={() => router.push('/run')}>
              続きから再開
            </BaseButton>
            <BaseButton
              fullWidth
              size="md"
              variant="ghost"
              onClick={() => {
                if (window.confirm('現在のランを破棄して最初から始めますか？')) {
                  reset();
                }
              }}
            >
              新しいランを始める
            </BaseButton>
          </div>
        ) : (
          <>
            {/* アーキタイプ選択 */}
            <section>
              <p className="mono text-[10px] tracking-[0.25em] text-[var(--text-3)] uppercase mb-3">
                スタイルを選ぶ
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {archetypes.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setArchetypeId(a.id)}
                    className={clsx(
                      'rounded-[var(--r)] border bg-[var(--card)] p-4 text-center transition-all',
                      archetypeId === a.id
                        ? 'border-[var(--accent)] shadow-[0_8px_20px_rgba(184,92,92,0.18)] -translate-y-0.5'
                        : 'border-[var(--edge2)] hover:border-[var(--text-3)]'
                    )}
                  >
                    <span
                      className="serif text-3xl font-bold block"
                      style={{ color: a.color }}
                    >
                      {a.glyph}
                    </span>
                    <span className="serif text-sm font-bold text-[var(--cream)] block mt-1.5">
                      {a.name}
                    </span>
                    <span className="text-[10.5px] text-[var(--text-2)] block mt-1.5 leading-snug">
                      {a.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="max-w-xs mx-auto space-y-3">
              <BaseButton
                fullWidth
                size="lg"
                onClick={() => {
                  startRun(archetypeId);
                  router.push('/run');
                }}
              >
                デバッグ開始
              </BaseButton>
              {hasResult && (
                <BaseButton fullWidth size="md" variant="ghost" onClick={() => router.push('/result')}>
                  前回の戦績を見る
                </BaseButton>
              )}
            </div>
          </>
        )}

        <footer className="text-[10px] text-[var(--text-3)] mono uppercase tracking-widest">
          v2.0 · Roguelike Build · localStorage 保存
        </footer>
      </div>
    </main>
  );
}

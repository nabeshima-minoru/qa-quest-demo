'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BaseButton from '@/components/common/BaseButton';
import { useGameStore } from '@/lib/gameStore';
import { hasSavedSession } from '@/lib/storage';

export default function TitlePage() {
  const hydrate = useGameStore((s) => s.hydrate);
  const reset = useGameStore((s) => s.reset);
  const status = useGameStore((s) => s.status);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    hydrate();
    setHasResume(hasSavedSession());
  }, [hydrate]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center space-y-10">
        <header className="space-y-3">
          <p className="mono text-[11px] tracking-[0.3em] text-[var(--text-3)] uppercase">
            QA Quest · Internal Demo
          </p>
          <h1 className="serif text-5xl text-[var(--cream)] leading-tight">
            テスター育成
            <br />
            シミュレーション
          </h1>
          <p className="text-[var(--text-2)] text-sm leading-relaxed pt-4">
            50 ターンの選択を通じて、テスターとしてのキャリアを歩み、
            <br />
            JSTQB の知識と現場の判断力を養う採用検査ゲーム。
          </p>
        </header>

        <div className="space-y-3 max-w-xs mx-auto">
          {hasResume && status === 'in_progress' ? (
            <>
              <Link href="/game" className="block">
                <BaseButton fullWidth size="lg">続きから再開</BaseButton>
              </Link>
              <BaseButton
                fullWidth
                size="md"
                variant="ghost"
                onClick={() => {
                  if (window.confirm('現在の進行を破棄して最初から始めますか？')) {
                    reset();
                    window.location.href = '/route-select';
                  }
                }}
              >
                新しいゲームを始める
              </BaseButton>
            </>
          ) : (
            <Link href="/route-select" className="block">
              <BaseButton fullWidth size="lg">ゲームを始める</BaseButton>
            </Link>
          )}
        </div>

        <footer className="text-[10px] text-[var(--text-3)] mono uppercase tracking-widest">
          v0.1 · localStorage 保存
        </footer>
      </div>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CharacterPanel from '@/components/game/CharacterPanel';
import EventCard from '@/components/game/EventCard';
import ChoiceList from '@/components/game/ChoiceList';
import ActionLog from '@/components/game/ActionLog';
import ActBanner from '@/components/game/ActBanner';
import BaseButton from '@/components/common/BaseButton';
import { useGameStore } from '@/lib/gameStore';
import { BALANCE } from '@/lib/constants';
import type { Choice } from '@/types';

export default function GamePage() {
  const router = useRouter();
  const hydrate = useGameStore((s) => s.hydrate);
  const status = useGameStore((s) => s.status);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const submitChoice = useGameStore((s) => s.submitChoice);
  const pendingRoleUp = useGameStore((s) => s.pendingRoleUp);
  const clearRoleUp = useGameStore((s) => s.clearRoleUp);
  const pendingQuiz = useGameStore((s) => s.pendingQuiz);
  const pendingRecap = useGameStore((s) => s.pendingRecap);
  const reset = useGameStore((s) => s.reset);

  // 初期化
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 優先度: 完了 > クイズ > 中間総括
  useEffect(() => {
    if (status === 'completed') {
      router.push('/score');
      return;
    }
    if (pendingQuiz) {
      router.push('/quiz');
      return;
    }
    if (pendingRecap !== null) {
      router.push('/recap');
    }
  }, [status, pendingQuiz, pendingRecap, router]);

  if (status === 'idle') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-[var(--text-2)] text-sm">
            進行中のセッションがありません。
          </p>
          <Link href="/route-select">
            <BaseButton>ルート選択へ</BaseButton>
          </Link>
        </div>
      </main>
    );
  }

  if (!currentEvent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-[var(--text-2)] text-sm">イベント読み込み中...</p>
      </main>
    );
  }

  const handleSubmit = (key: Choice['key']) => {
    submitChoice(key);
    // 画面の上にスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
        <div className="grid gap-5 lg:grid-cols-[300px_1fr_220px]">
          {/* Left: Character */}
          <div className="lg:order-1">
            <CharacterPanel />
          </div>

          {/* Center: Event + choices */}
          <div className="lg:order-2 space-y-5">
            <ActBanner />
            <EventCard key={currentEvent.id} event={currentEvent} />
            <div className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-5">
              <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)] mb-3">
                Choices
              </h3>
              <ChoiceList
                key={currentEvent.id}
                choices={currentEvent.choices}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* Right: Log */}
          <div className="lg:order-3 space-y-5">
            <aside className="bg-[var(--card)] border border-[var(--edge2)] rounded-[var(--r)] p-4 space-y-3">
              <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-3)]">
                Recent Actions
              </h3>
              <ActionLog />
            </aside>
            <BaseButton
              fullWidth
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm('現在の進行を放棄してタイトルに戻りますか？')) {
                  reset();
                  router.push('/');
                }
              }}
            >
              リセット
            </BaseButton>
          </div>
        </div>
      </main>

      {/* Role-up Modal */}
      {pendingRoleUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2520]/40 backdrop-blur-sm px-6"
          onClick={clearRoleUp}
        >
          <div
            className="bg-[var(--card)] border border-[var(--brass)] rounded-[var(--r)] px-8 py-10 max-w-md w-full text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mono text-[11px] tracking-[0.3em] text-[var(--brass)] uppercase">
              Promotion
            </p>
            <h2 className="serif text-2xl text-[var(--cream)]">ロール昇格！</h2>
            <div className="text-[var(--text-2)] space-y-1 text-sm">
              <p className="mono">
                {BALANCE.ROLES.find((r) => r.id === pendingRoleUp.from)?.name ?? pendingRoleUp.from}
              </p>
              <p>↓</p>
              <p className="serif text-xl text-[var(--brass)]">
                {BALANCE.ROLES.find((r) => r.id === pendingRoleUp.to)?.name ?? pendingRoleUp.to}
              </p>
            </div>
            <BaseButton onClick={clearRoleUp} size="md">
              閉じる
            </BaseButton>
          </div>
        </div>
      )}
    </>
  );
}

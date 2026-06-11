'use client';

// QA Quest — ランシェル
// map / battle / event / study / rest / perk をビュー状態機械で切り替える。
// 報酬・ピッカー・デッキ確認はオーバーレイ。

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseProgressBar from '@/components/common/BaseProgressBar';
import BattleView from '@/components/battle/BattleView';
import MapView from '@/components/map/MapView';
import {
  DeckOverlay,
  EventView,
  PerkView,
  PickerOverlay,
  RestView,
  RewardOverlay,
  StudyView,
} from '@/components/run/PanelViews';
import { useRunStore } from '@/lib/runStore';

export default function RunPage() {
  const router = useRouter();
  const hydrate = useRunStore((s) => s.hydrate);
  const status = useRunStore((s) => s.status);
  const view = useRunStore((s) => s.view);
  const hp = useRunStore((s) => s.hp);
  const maxHp = useRunStore((s) => s.maxHp);
  const deck = useRunStore((s) => s.deck);
  const act = useRunStore((s) => s.act);
  const rewardCards = useRunStore((s) => s.rewardCards);
  const picker = useRunStore((s) => s.picker);

  const [ready, setReady] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (status === 'idle') router.replace('/');
    else if (status === 'result') router.replace('/result');
  }, [ready, status, router]);

  if (!ready || status !== 'run') return null;

  return (
    <main className="min-h-screen">
      {/* ステータスバー（バトル中は非表示：バトル側に統合） */}
      {view !== 'battle' && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] px-4 py-2">
            <span className="serif text-xs font-bold text-[var(--cream)] shrink-0 hidden sm:block">
              QA テスター
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline whitespace-nowrap text-[10px] mb-0.5">
                <span className="text-[var(--text-2)]">メンタル</span>
                <span className="mono text-[var(--text-2)]">
                  {hp} / {maxHp}
                </span>
              </div>
              <BaseProgressBar
                value={hp}
                max={maxHp}
                color={hp / maxHp < 0.3 ? 'var(--danger)' : hp / maxHp < 0.6 ? 'var(--warn)' : 'var(--success)'}
                height={8}
              />
            </div>
            <button
              onClick={() => setDeckOpen(true)}
              className="mono text-[10px] text-[var(--text-2)] border border-[var(--edge2)] rounded-[var(--r-sm)] px-2 py-1 hover:bg-[var(--card2)] shrink-0"
            >
              デッキ {deck.length}
            </button>
            <span className="mono text-[10px] text-[var(--text-3)] shrink-0">ACT {act}/3</span>
          </div>
        </div>
      )}

      {view === 'map' && <MapView />}
      {view === 'battle' && <BattleView />}
      {view === 'event' && <EventView />}
      {view === 'study' && <StudyView />}
      {view === 'rest' && <RestView />}
      {view === 'perk' && <PerkView />}

      {rewardCards && <RewardOverlay />}
      {picker && <PickerOverlay />}
      {deckOpen && <DeckOverlay onClose={() => setDeckOpen(false)} />}
    </main>
  );
}

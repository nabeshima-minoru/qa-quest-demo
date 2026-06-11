'use client';

// QA Quest — イベント / 勉強会 / 休憩 / 昇進 / 報酬 / カードピッカー
// マップ系の小規模ビューをひとつのファイルに集約。

import { useState } from 'react';
import clsx from 'clsx';
import BaseButton from '@/components/common/BaseButton';
import CardView from '@/components/battle/CardView';
import { useRunStore } from '@/lib/runStore';
import { findEvent } from '@/data/runEvents';
import { findPerk } from '@/data/perks';
import { findCard } from '@/data/cards';
import { ACT_META } from '@/lib/constants';
import type { CardInstance } from '@/types';

/*──────────── 共通パネル枠 ────────────*/

function Panel({
  glyph,
  glyphColor,
  kicker,
  title,
  children,
}: {
  glyph: string;
  glyphColor: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-10">
      <div className="qa-overlay-in rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-6 text-center">
        <p className="mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-3)]">{kicker}</p>
        <div className="relative grid place-items-center h-24 my-2">
          <span
            className="absolute rounded-full border-2 opacity-20"
            style={{ width: 76, height: 76, borderColor: glyphColor }}
          />
          <span className="serif text-5xl font-bold" style={{ color: glyphColor }}>
            {glyph}
          </span>
        </div>
        <h2 className="serif text-xl font-bold text-[var(--cream)] mb-3">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/*──────────── イベント ────────────*/

export function EventView() {
  const eventId = useRunStore((s) => s.eventId);
  const resultText = useRunStore((s) => s.resultText);
  const chooseEventOption = useRunStore((s) => s.chooseEventOption);
  const continueFromResult = useRunStore((s) => s.continueFromResult);
  const ev = findEvent(eventId ?? '');
  if (!ev) return null;

  return (
    <Panel glyph={ev.glyph} glyphColor="var(--st-ai)" kicker="Event" title={ev.name}>
      <p className="text-xs text-[var(--text-2)] leading-relaxed text-left whitespace-pre-wrap mb-5">
        {ev.text}
      </p>
      {resultText === null ? (
        <div className="space-y-2">
          {ev.choices.map((c, i) => (
            <button
              key={c.label}
              onClick={() => chooseEventOption(i)}
              className="w-full text-left rounded-[var(--r-sm)] border border-[var(--edge2)] bg-[var(--card2)] px-4 py-3 hover:border-[var(--accent)] hover:bg-[var(--accent-l)] transition-colors"
            >
              <p className="serif text-sm font-bold text-[var(--cream)]">{c.label}</p>
              <p className="mono text-[10px] text-[var(--text-2)] mt-0.5">{c.detail}</p>
            </button>
          ))}
        </div>
      ) : (
        <ResultBlock text={resultText} onContinue={continueFromResult} />
      )}
    </Panel>
  );
}

/*──────────── 勉強会 ────────────*/

export function StudyView() {
  const resultText = useRunStore((s) => s.resultText);
  const studyChoose = useRunStore((s) => s.studyChoose);
  const continueFromResult = useRunStore((s) => s.continueFromResult);

  return (
    <Panel glyph="学" glyphColor="var(--st-anal)" kicker="Study" title="社内勉強会">
      <p className="text-xs text-[var(--text-2)] leading-relaxed mb-5">
        ホワイトボードと付箋、そして良い議論。手持ちの技を磨くか、不要な癖を手放すか。
      </p>
      {resultText === null ? (
        <div className="space-y-2">
          <button
            onClick={() => studyChoose('upgrade')}
            className="w-full text-left rounded-[var(--r-sm)] border border-[var(--edge2)] bg-[var(--card2)] px-4 py-3 hover:border-[var(--brass)] hover:bg-[var(--brass-l)] transition-colors"
          >
            <p className="serif text-sm font-bold text-[var(--cream)]">技を磨く</p>
            <p className="mono text-[10px] text-[var(--text-2)] mt-0.5">カードを 1 枚選んで強化</p>
          </button>
          <button
            onClick={() => studyChoose('remove')}
            className="w-full text-left rounded-[var(--r-sm)] border border-[var(--edge2)] bg-[var(--card2)] px-4 py-3 hover:border-[var(--accent)] hover:bg-[var(--accent-l)] transition-colors"
          >
            <p className="serif text-sm font-bold text-[var(--cream)]">癖を手放す</p>
            <p className="mono text-[10px] text-[var(--text-2)] mt-0.5">カードを 1 枚デッキから除去</p>
          </button>
        </div>
      ) : (
        <ResultBlock text={resultText} onContinue={continueFromResult} />
      )}
    </Panel>
  );
}

/*──────────── 休憩 ────────────*/

export function RestView() {
  const resultText = useRunStore((s) => s.resultText);
  const restAction = useRunStore((s) => s.restAction);
  const continueFromResult = useRunStore((s) => s.continueFromResult);

  return (
    <Panel glyph="休" glyphColor="var(--success)" kicker="Rest" title="ひと息つく">
      <p className="text-xs text-[var(--text-2)] leading-relaxed mb-5">
        給湯室の窓から夕陽が差している。急須に湯を注ぐ音だけが響く、静かな時間。
      </p>
      {resultText === null ? (
        <BaseButton fullWidth size="lg" onClick={restAction}>
          お茶を淹れて休む
        </BaseButton>
      ) : (
        <ResultBlock text={resultText} onContinue={continueFromResult} />
      )}
    </Panel>
  );
}

/*──────────── 昇進パーク ────────────*/

export function PerkView() {
  const perkChoices = useRunStore((s) => s.perkChoices);
  const pickPerk = useRunStore((s) => s.pickPerk);
  const act = useRunStore((s) => s.act);
  const cleared = ACT_META[act - 1];

  if (!perkChoices) return null;
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10 text-center">
      <p className="mono text-[10px] tracking-[0.3em] uppercase text-[var(--brass-d)] qa-pulse">
        Act Clear
      </p>
      <h2 className="serif text-3xl font-bold text-[var(--cream)] mt-1">
        {cleared.name}『{cleared.title}』制覇
      </h2>
      <p className="text-xs text-[var(--text-2)] mt-2 mb-6">
        実績が認められた。次の現場に向けて、ひとつ選ぼう。
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {perkChoices.map((id) => {
          const p = findPerk(id);
          if (!p) return null;
          return (
            <button
              key={id}
              onClick={() => pickPerk(id)}
              className="qa-overlay-in rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-4 hover:border-[var(--brass)] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(138,116,68,0.2)] transition-all text-center"
            >
              <p className="mono text-[8px] tracking-widest text-[var(--text-3)] uppercase">{p.role}</p>
              <p className="serif text-3xl font-bold text-[var(--brass-d)] my-2">{p.glyph}</p>
              <p className="serif text-sm font-bold text-[var(--cream)] leading-tight">{p.name}</p>
              <p className="text-[10.5px] text-[var(--text-2)] mt-2 leading-snug">{p.text}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/*──────────── 報酬オーバーレイ ────────────*/

export function RewardOverlay() {
  const rewardCards = useRunStore((s) => s.rewardCards);
  const afterReward = useRunStore((s) => s.afterReward);
  const pickReward = useRunStore((s) => s.pickReward);
  if (!rewardCards) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(42,37,32,0.55)] px-4">
      <div className="qa-overlay-in w-full max-w-lg rounded-[var(--r)] border-2 border-[var(--brass)] bg-[var(--card)] p-6 text-center">
        <p className="mono text-[10px] tracking-[0.3em] text-[var(--brass-d)] uppercase">Victory</p>
        <h2 className="serif text-2xl font-bold text-[var(--cream)] mt-1 mb-1">バグを退治した</h2>
        <p className="text-[11px] text-[var(--text-2)] mb-4">
          {afterReward === 'victory'
            ? '最後の大障害を鎮めた。戦利品をひとつ選ぼう。'
            : '戦利品として、新しい技をひとつ習得できる。'}
        </p>
        <div className="flex justify-center gap-2.5 flex-wrap">
          {rewardCards.map((defId) => {
            const def = findCard(defId);
            if (!def) return null;
            const inst: CardInstance = { uid: `rw-${defId}`, defId, upgraded: false };
            return (
              <div key={defId} className="qa-card-in">
                <CardView card={inst} small onClick={() => pickReward(defId)} />
              </div>
            );
          })}
        </div>
        <button
          onClick={() => pickReward(null)}
          className="mt-4 mono text-[11px] text-[var(--text-3)] underline underline-offset-4 hover:text-[var(--text-2)]"
        >
          受け取らずに進む
        </button>
      </div>
    </div>
  );
}

/*──────────── カードピッカー ────────────*/

export function PickerOverlay() {
  const picker = useRunStore((s) => s.picker);
  const deck = useRunStore((s) => s.deck);
  const applyPick = useRunStore((s) => s.applyPick);
  const cancelPicker = useRunStore((s) => s.cancelPicker);
  const [confirmUid, setConfirmUid] = useState<string | null>(null);

  if (!picker) return null;
  const candidates = picker === 'upgrade' ? deck.filter((c) => !c.upgraded) : deck;
  const title = picker === 'upgrade' ? '強化するカードを選ぶ' : '除去するカードを選ぶ';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(42,37,32,0.55)] px-4 py-8">
      <div className="qa-overlay-in max-w-2xl mx-auto rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="serif text-lg font-bold text-[var(--cream)]">{title}</h3>
          <button
            onClick={cancelPicker}
            className="mono text-[11px] text-[var(--text-3)] underline underline-offset-4"
          >
            やめておく
          </button>
        </div>
        {candidates.length === 0 ? (
          <p className="text-xs text-[var(--text-2)]">対象にできるカードがない。</p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {candidates.map((c) => (
              <div key={c.uid} className={clsx(confirmUid === c.uid && 'qa-pick-confirm')}>
                <CardView
                  card={c}
                  small
                  selected={confirmUid === c.uid}
                  onClick={() =>
                    confirmUid === c.uid ? applyPick(c.uid) : setConfirmUid(c.uid)
                  }
                />
              </div>
            ))}
          </div>
        )}
        {confirmUid && (
          <p className="text-center mono text-[10px] text-[var(--accent)] mt-3 qa-pulse">
            もう一度押すと確定
          </p>
        )}
      </div>
    </div>
  );
}

/*──────────── デッキ確認オーバーレイ ────────────*/

export function DeckOverlay({ onClose }: { onClose: () => void }) {
  const deck = useRunStore((s) => s.deck);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(42,37,32,0.55)] px-4 py-8" onClick={onClose}>
      <div
        className="qa-overlay-in max-w-2xl mx-auto rounded-[var(--r)] border border-[var(--edge2)] bg-[var(--card)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="serif text-lg font-bold text-[var(--cream)]">デッキ（{deck.length} 枚）</h3>
          <button onClick={onClose} className="mono text-[11px] text-[var(--text-3)] underline underline-offset-4">
            閉じる
          </button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {deck.map((c) => (
            <CardView key={c.uid} card={c} small />
          ))}
        </div>
      </div>
    </div>
  );
}

/*──────────── 結果テキスト共通 ────────────*/

function ResultBlock({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <div className="qa-overlay-in space-y-4">
      <p className="text-sm text-[var(--text)] leading-relaxed border-t border-[var(--edge)] pt-4">
        {text}
      </p>
      <BaseButton fullWidth size="md" onClick={onContinue}>
        マップへ戻る
      </BaseButton>
    </div>
  );
}

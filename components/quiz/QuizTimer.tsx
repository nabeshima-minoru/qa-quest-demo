'use client';

import { useEffect, useRef, useState } from 'react';
import BaseProgressBar from '@/components/common/BaseProgressBar';

interface Props {
  duration: number; // 秒
  onTimeout: () => void;
  paused?: boolean;
  resetKey?: string | number;
}

export default function QuizTimer({ duration, onTimeout, paused, resetKey }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const timeoutCalled = useRef(false);

  useEffect(() => {
    setElapsed(0);
    timeoutCalled.current = false;
  }, [resetKey, duration]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1;
        if (next >= duration && !timeoutCalled.current) {
          timeoutCalled.current = true;
          onTimeout();
        }
        return Math.min(next, duration);
      });
    }, 100);
    return () => clearInterval(id);
  }, [duration, onTimeout, paused]);

  const remaining = Math.max(0, duration - elapsed);
  const color = remaining < duration * 0.25 ? 'var(--danger)' : 'var(--brass)';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-[var(--text-3)] uppercase tracking-widest">Time</span>
        <span className="mono text-[var(--cream)]">
          {Math.ceil(remaining)} s
        </span>
      </div>
      <BaseProgressBar value={remaining} max={duration} color={color} height={3} />
    </div>
  );
}

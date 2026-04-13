'use client';
import { useEffect, useState } from 'react';
import type { Grade } from '@/lib/types';

const GRADE_COLOR: Record<Grade, string> = {
  A: '#4ade80',
  B: '#a3e635',
  C: '#fbbf24',
  D: '#fb923c',
  F: '#f87171',
};

// Gradient stop pairs for the ring
const GRADE_STOPS: Record<Grade, [string, string]> = {
  A: ['#4ade80', '#22c55e'],
  B: ['#a3e635', '#84cc16'],
  C: ['#fbbf24', '#f59e0b'],
  D: ['#fb923c', '#f97316'],
  F: ['#f87171', '#ef4444'],
};

export function ScoreRing({
  score, grade,
  size = 80, stroke = 5,
}: {
  score: number; grade: Grade;
  size?: number; stroke?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);

  const cx = size / 2;
  const cy = size / 2;
  const r = cx - stroke / 2 - 1;
  const circ = 2 * Math.PI * r;

  const id = `ring-grad-${grade}-${size}`;
  const [start, end] = GRADE_STOPS[grade];
  const mainColor = GRADE_COLOR[grade];

  useEffect(() => {
    const t = setTimeout(() => {
      // Animate ring fill
      let p = 0;
      const step = () => {
        p = Math.min(p + 0.025, score / 100);
        setProgress(p);
        if (p < score / 100) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);

      // Animate counter
      const dur = 900;
      const t0 = performance.now();
      const tick = (now: number) => {
        const pct = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - pct, 3);
        setCount(Math.round(ease * score));
        if (pct < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 120);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - progress * circ;
  const isLarge = size >= 88;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.04s linear' }}
        />
      </svg>

      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: isLarge ? Math.round(size * 0.28) : Math.round(size * 0.3),
          fontWeight: 700,
          color: mainColor,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}
        </span>
        {isLarge && (
          <span style={{
            fontSize: Math.round(size * 0.09),
            color: 'var(--text-muted)',
            marginTop: 3,
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.04em',
          }}>
            {grade === 'A' ? 'Excellent' : grade === 'B' ? 'Good' : grade === 'C' ? 'Average' : grade === 'D' ? 'Poor' : 'Critical'}
          </span>
        )}
        {!isLarge && (
          <span style={{
            fontSize: Math.round(size * 0.13),
            color: 'var(--text-muted)',
            marginTop: 2,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}>
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import type { Suggestion } from '@/lib/types';

type FW = 'html' | 'nextjs' | 'astro';

function CopyBtn({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(code); setDone(true); setTimeout(() => setDone(false), 2000); };
  return (
    <button onClick={copy} className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>
      {done
        ? <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, color: '#22c55e' }} fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
        : <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

export function FixSuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  const [fw, setFw] = useState<FW>('html');

  if (!suggestions.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, color: '#22c55e' }} fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontSize: 13, color: '#555' }}>No fixes needed — all checks passed</div>
      </div>
    );
  }

  const code = (s: Suggestion) => fw === 'html' ? s.html : fw === 'nextjs' ? s.nextjs : s.astro;

  const FW_OPTIONS: { key: FW; label: string }[] = [
    { key: 'html', label: 'HTML' }, { key: 'nextjs', label: 'Next.js' }, { key: 'astro', label: 'Astro' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Framework selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: '#555' }}>Framework</span>
        <div style={{ display: 'flex', padding: 2, borderRadius: 8, background: '#111', border: '1px solid #1e1e1e' }}>
          {FW_OPTIONS.map(f => (
            <button key={f.key} onClick={() => setFw(f.key)} className="mono"
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: fw === f.key ? '#1e1e1e' : 'transparent',
                color: fw === f.key ? '#ededed' : '#555',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {suggestions.map(s => {
          const sc = s.severity === 'error' ? '#f87171' : s.severity === 'warning' ? '#eab308' : '#60a5fa';
          return (
            <div key={s.id} style={{ border: `1px solid ${sc}18`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${sc}04`, borderBottom: `1px solid ${sc}10` }}>
                <span className="badge" style={{ fontSize: 10, color: sc, background: `${sc}10`, borderColor: `${sc}20` }}>{s.severity}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#ccc' }}>{s.title}</span>
              </div>
              <div style={{ background: '#0d0d0d', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 1 }}>
                  <CopyBtn code={code(s)} />
                </div>
                <pre style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: '#7a7a7a', overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre-wrap', paddingRight: 80 }}>{code(s)}</pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

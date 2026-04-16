'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAnalyzerStore } from '@/store/useAnalyzerStore';
import { timeAgo } from '@/lib/utils';

function isValidUrl(s: string): boolean {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

const EXAMPLES = ['https://vercel.com', 'https://github.com', 'https://stripe.com', 'https://nextjs.org'];
const GRADE_COLORS: Record<string, string> = { A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', F: '#f87171' };

export function URLInput() {
  const { loading, setLoading, setResult, setError, error, history, clearHistory, addToHistory } = useAnalyzerStore();
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const run = useCallback(async (target?: string) => {
    const raw = (target ?? val).trim();
    if (!raw) { setErr('Enter a URL'); return; }
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    if (!isValidUrl(url)) { setErr('Not a valid URL'); return; }
    setVal(url); setErr(''); setOpen(false);
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Analysis failed'); return; }
      setResult(data);
      addToHistory({ url, score: data.score, grade: data.grade, timestamp: Date.now(), title: data.meta?.title || data.og?.title });
    } catch { setError('Network error — check your connection.'); }
    finally { setLoading(false); }
  }, [val, setLoading, setResult, setError, addToHistory]);

  const borderColor = err ? 'rgba(248,113,113,0.4)' : focused ? '#2a2a2a' : '#1e1e1e';

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', height: 44,
        background: '#111', border: `1px solid ${borderColor}`,
        borderRadius: 10, transition: 'border-color 0.15s',
      }}>
        {/* Search / spinner */}
        {loading ? (
          <span style={{ width: 16, height: 16, border: '1.5px solid #333', borderTopColor: '#888', borderRadius: '50%', flexShrink: 0, animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <svg style={{ width: 15, height: 15, color: '#444', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        )}

        <input
          ref={inputRef}
          value={val}
          onChange={e => { setVal(e.target.value); if (err) setErr(''); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); run(); } if (e.key === 'Escape') setOpen(false); }}
          placeholder="https://yoursite.com"
          className="url-input"
          autoComplete="off"
          spellCheck={false}
        />

        {val && !loading && (
          <button onClick={() => { setVal(''); setErr(''); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 2, display: 'flex', lineHeight: 1 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <button onClick={() => run()} disabled={loading} className="btn btn-primary" style={{ flexShrink: 0 }}>
          {loading ? 'Analyzing…' : <>Analyze <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14m-7-7 7 7-7 7" /></svg></>}
        </button>
      </div>

      {/* Validation error */}
      {err && <p style={{ marginTop: 6, fontSize: 12, color: '#f87171', paddingLeft: 2 }}>{err}</p>}

      {/* API error */}
      {error && !loading && (
        <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', fontSize: 12, color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Dropdown */}
      {open && !loading && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#111', border: '1px solid #1e1e1e', borderRadius: 10,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 100, overflow: 'hidden',
        }}>
          {history.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #1a1a1a' }}>
                <span className="mono" style={{ fontSize: 11, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Recent
                </span>
                <button onClick={clearHistory} className="btn btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }}>Clear</button>
              </div>
              {history.slice(0, 5).map(h => (
                <button key={h.url} onClick={() => run(h.url)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, width: 16, textAlign: 'center', color: GRADE_COLORS[h.grade] || '#888' }}>{h.grade}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.url}</div>
                    {h.title && <div style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</div>}
                  </div>
                  <span style={{ fontSize: 11, color: '#444', flexShrink: 0 }}>{timeAgo(h.timestamp)}</span>
                </button>
              ))}
              <div style={{ borderTop: '1px solid #1a1a1a' }} />
            </>
          )}

          {/* Examples */}
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#444', marginBottom: 8 }}>Try these</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXAMPLES.map(u => (
                <button key={u} onClick={() => run(u)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace',
                  color: '#666', background: '#161616', border: '1px solid #1e1e1e', cursor: 'pointer', transition: 'all 0.1s',
                }}
                  onMouseEnter={e => { (e.currentTarget.style.color = '#aaa'); (e.currentTarget.style.borderColor = '#2a2a2a'); }}
                  onMouseLeave={e => { (e.currentTarget.style.color = '#666'); (e.currentTarget.style.borderColor = '#1e1e1e'); }}
                >
                  {u.replace('https://', '')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '6px 12px 8px', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, color: '#333' }} fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
            <span className="mono" style={{ fontSize: 11, color: '#333' }}>Enter to analyze</span>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

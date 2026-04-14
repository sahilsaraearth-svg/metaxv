'use client';
import { useEffect } from 'react';
import { URLInput } from '@/components/URLInput';
import { ResultsTabs } from '@/components/ResultsTabs';
import { ResultsSkeleton } from '@/components/ui/Skeleton';
import { useAnalyzerStore } from '@/store/useAnalyzerStore';

export default function Page() {
  const { loading, result, setLoading, setResult, setError, addToHistory } = useAnalyzerStore();

  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get('url');
    if (!u) return;
    (async () => {
      setLoading(true); setError(null); setResult(null);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: u }),
        });
        const data = await res.json();
        if (res.ok) {
          setResult(data);
          addToHistory({ url: u, score: data.score, grade: data.grade, timestamp: Date.now(), title: data.meta?.title || data.og?.title });
        } else setError(data.error || 'Failed');
      } catch { setError('Network error'); }
      finally { setLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Topbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11,11,12,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}>
        <div className="container" style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              background: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 14 14" style={{ width: 9, height: 9 }} fill="var(--bg)">
                <path d="M7 1L13 12H1L7 1Z" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>metaxv</span>
            <span className="mono" style={{ fontSize: 9, color: 'var(--text-muted)', padding: '1px 5px', border: '1px solid var(--border-subtle)', borderRadius: 3 }}>v1.0</span>
          </div>

          {/* Right nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span className="hide-mobile" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              OG &amp; Twitter Card Analyzer
            </span>
            <a
              href="https://github.com"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11.5, color: 'var(--text-tertiary)',
                border: '1px solid var(--border)', padding: '4px 10px',
                borderRadius: 6, textDecoration: 'none',
                transition: 'color 0.12s, border-color 0.12s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--text-secondary)';
                el.style.borderColor = 'var(--border-focus)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--text-tertiary)';
                el.style.borderColor = 'var(--border)';
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }} fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 72, paddingBottom: 52, textAlign: 'center' }}>
        <div className="container">
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 9999,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            marginBottom: 24,
          }}>
            <span className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'block' }} />
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>Analyzes in under 1 second</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(24px, 3.8vw, 44px)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Open Graph &amp; Twitter Card
            <br />
            <span style={{ color: 'var(--text-muted)' }}>Analyzer</span>
          </h1>

          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Fetch any URL, validate all metadata, score it, and preview
            how it renders across every major platform.
          </p>

          {/* URL Input */}
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <URLInput />
          </div>
        </div>
      </section>

      {/* ── Results / Empty ── */}
      <div className="container" style={{ flex: 1, paddingBottom: 80 }}>
        {!result && !loading && <EmptyState />}
        {loading && <ResultsSkeleton />}
        {result && !loading && <ResultsTabs result={result} />}
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>metaxv · MIT</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Next.js · Cheerio · Zod</span>
        </div>
      </footer>

    </div>
  );
}

function EmptyState() {
  const FEATURES = [
    { label: 'Deep Parse', desc: 'All og:* and twitter:* tags via Cheerio' },
    { label: '17 Checks', desc: 'Errors, warnings, info — scored by severity' },
    { label: 'A–F Grading', desc: 'Score deducted per issue type, instant grade' },
    { label: '9 Previews', desc: 'Google, X, LinkedIn, Discord, WhatsApp +4' },
    { label: 'Fix Snippets', desc: 'HTML, Next.js & Astro-ready code' },
    { label: 'Export & Share', desc: 'PNG previews, JSON reports, share links' },
  ];

  return (
    <div>
      {/* Feature table */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        border: '1px solid var(--border)',
        borderRadius: 8, overflow: 'hidden',
        marginBottom: 16,
      }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            padding: '16px 18px',
            background: 'var(--bg-card)',
            borderRight: i % 3 !== 2 ? '1px solid var(--border)' : 'none',
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 3 }}>{f.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <p className="mono" style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--text-muted)' }}>
        ↑ paste a URL above and press Enter
      </p>
    </div>
  );
}

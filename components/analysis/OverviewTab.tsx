'use client';
import type { AnalysisResult } from '@/lib/types';

function tr(s: string | undefined, n: number) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export function OverviewTab({ result }: { result: AnalysisResult }) {
  const { score, grade, issues, og, meta, twitter, images } = result;
  const errors   = issues.filter(i => !i.passed && i.severity === 'error');
  const warnings = issues.filter(i => !i.passed && i.severity === 'warning');
  const infos    = issues.filter(i => !i.passed && i.severity === 'info');
  const passed   = issues.filter(i => i.passed);

  const GRADE_COLOR: Record<string, string> = {
    A: '#4ade80', B: '#a3e635', C: '#fbbf24', D: '#fb923c', F: '#f87171',
  };
  const color = GRADE_COLOR[grade] || '#888';

  const imageUrl = og.image || twitter.image;

  const checks = [
    { k: '<title>',           ok: !!meta.title,        v: meta.title },
    { k: 'meta description',  ok: !!meta.description,  v: meta.description },
    { k: 'og:title',          ok: !!og.title,          v: og.title },
    { k: 'og:description',    ok: !!og.description,    v: og.description },
    { k: 'og:image',          ok: !!og.image,          v: og.image },
    { k: 'og:url',            ok: !!og.url,            v: og.url },
    { k: 'og:type',           ok: !!og.type,           v: og.type },
    { k: 'og:site_name',      ok: !!og.siteName,       v: og.siteName },
    { k: 'twitter:card',      ok: !!twitter.card,      v: twitter.card },
    { k: 'twitter:image',     ok: !!(twitter.image || og.image), v: twitter.image || og.image },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Score breakdown */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <span className="section-label">Score Breakdown</span>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          {/* Big number */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              fontSize: 52, fontWeight: 700, color,
              lineHeight: 1, letterSpacing: '-0.05em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {score}
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>/ 100</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {[
              { label: 'Errors',   val: errors.length,   color: '#f87171', pts: errors.length * 10 },
              { label: 'Warnings', val: warnings.length, color: '#fbbf24', pts: warnings.length * 5 },
              { label: 'Info',     val: infos.length,    color: '#60a5fa', pts: infos.length * 2 },
              { label: 'Passed',   val: passed.length,   color: '#4ade80', pts: null },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', width: 60 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color, fontVariantNumeric: 'tabular-nums', width: 24 }}>{s.val}</span>
                {s.pts !== null && s.val > 0 && (
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>−{s.pts} pts</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Score bar */}
        <div style={{ margin: '0 24px 20px' }}>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${score}%`,
              background: color,
              borderRadius: 9999,
              transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>
      </div>

      {/* Two-col: page info + tag presence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Page info */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            <span className="section-label">Page Info</span>
          </div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {imageUrl && (
              <div style={{ borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg)', aspectRatio: '1.91/1' }}>
                <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
              </div>
            )}
            {[
              { k: 'Title',        v: og.title || meta.title },
              { k: 'Description',  v: og.description || meta.description },
              { k: 'Site Name',    v: og.siteName },
              { k: 'Type',         v: og.type },
              { k: 'Twitter Card', v: twitter.card },
            ].filter(r => r.v).map(row => (
              <div key={row.k}>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{row.k}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{tr(row.v!, 100)}</div>
              </div>
            ))}
            {images.width && images.height && (
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Image Size</div>
                <div className="mono" style={{ fontSize: 11, color: images.valid ? '#4ade80' : '#fbbf24' }}>
                  {images.width} × {images.height}px · {images.aspectRatio?.toFixed(2)}:1
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tag presence */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            <span className="section-label">Tag Presence</span>
          </div>
          <div>
            {checks.map(({ k, ok, v }, i) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px',
                borderBottom: i < checks.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                {/* Status dot */}
                <div style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: ok ? '#4ade80' : '#f87171',
                  opacity: ok ? 0.8 : 0.5,
                }} />
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)', width: 130, flexShrink: 0 }}>{k}</span>
                {ok && v && <span style={{ fontSize: 10.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr(v, 28)}</span>}
                {!ok && <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>missing</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

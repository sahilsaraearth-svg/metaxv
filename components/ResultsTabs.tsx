'use client';
import { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { AnalysisResult } from '@/lib/types';
import { OverviewTab } from './analysis/OverviewTab';
import { IssuesList } from './analysis/IssuesList';
import { FixSuggestions } from './analysis/FixSuggestions';
import { PreviewsTab } from './analysis/PreviewsTab';
import { RawData } from './analysis/RawData';
import { ScoreRing } from './analysis/ScoreRing';
import { formatUrl } from '@/lib/utils';

// ─── Category score computation ───────────────────────────────────────────────
function computeCategories(result: AnalysisResult) {
  const { issues, og, twitter, meta, images } = result;

  function pct(ids: string[]) {
    const rel = issues.filter(i => ids.includes(i.id));
    if (!rel.length) return 100;
    const pts = rel.reduce((acc, i) => {
      if (i.passed) return acc;
      return acc - (i.severity === 'error' ? 35 : i.severity === 'warning' ? 18 : 7);
    }, 100);
    return Math.max(0, Math.min(100, pts));
  }

  const total = issues.length;
  const passIds = issues.filter(i => i.passed).map(i => i.id);

  return [
    {
      label: 'Essential',
      ids: ['meta:title', 'meta:description', 'og:title', 'og:description'],
      max: 4,
    },
    {
      label: 'Open Graph',
      ids: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name'],
      max: 6,
    },
    {
      label: 'Twitter / X',
      ids: ['twitter:card', 'twitter:title', 'twitter:image'],
      max: 3,
    },
    {
      label: 'Images',
      ids: ['og:image', 'og:image:dimensions', 'og:image:alt'],
      max: 3,
    },
    {
      label: 'Technical',
      ids: ['meta:title', 'title:length', 'description:length', 'og:url'],
      max: 4,
    },
    {
      label: 'Extras',
      ids: ['og:type', 'og:site_name'],
      max: 2,
    },
  ].map(cat => {
    const rel = issues.filter(i => cat.ids.includes(i.id));
    const pass = rel.filter(i => i.passed).length;
    const catTotal = rel.length || cat.max;
    const score = catTotal > 0 ? Math.round((pass / catTotal) * 25) : 25;
    const pctVal = catTotal > 0 ? (pass / catTotal) * 100 : 100;
    return { label: cat.label, score, max: 25, pct: pctVal };
  });
}

function scoreColor(pct: number) {
  if (pct >= 90) return '#4ade80';
  if (pct >= 70) return '#a3e635';
  if (pct >= 50) return '#fbbf24';
  return '#f87171';
}

function gradeMsg(grade: string) {
  if (grade === 'A') return 'Outstanding — everything is set up perfectly.';
  if (grade === 'B') return 'Good work! A few optimizations will make it perfect.';
  if (grade === 'C') return 'Some important tags are missing or suboptimal.';
  if (grade === 'D') return 'Several critical issues are hurting your previews.';
  return 'Critical — metadata needs immediate attention.';
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ResultsTabs({ result }: { result: AnalysisResult }) {
  const [tab, setTab] = useState('previews');
  const [copied, setCopied] = useState(false);
  const [animated, setAnimated] = useState(false);

  const err  = result.issues.filter(i => !i.passed && i.severity === 'error').length;
  const warn = result.issues.filter(i => !i.passed && i.severity === 'warning').length;
  const pass = result.issues.filter(i => i.passed).length;
  const fail = result.issues.filter(i => !i.passed).length;
  const cats = computeCategories(result);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const exportJSON = () => {
    const { rawHtml: _, ...data } = result as typeof result & { rawHtml?: string };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `metaxv-${Date.now()}.json`;
    a.click();
  };

  const share = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}?url=${encodeURIComponent(result.url)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: 'previews',  label: 'Previews' },
    { id: 'basic',     label: 'Basic', count: fail || undefined },
    { id: 'og',        label: 'Open Graph' },
    { id: 'twitter',   label: 'X / Twitter' },
    { id: 'images',    label: 'Images' },
    { id: 'raw',       label: 'Raw' },
    { id: 'score',     label: 'Score' },
  ];

  return (
    <div className="fade-up">

      {/* ── Score card ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
      }}>

        {/* Top row: ring + summary + stats + actions */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 24, padding: '22px 24px',
          flexWrap: 'wrap',
        }}>

          {/* Score ring */}
          <ScoreRing score={result.score} grade={result.grade} size={92} stroke={5} />

          {/* Summary */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>
              {gradeMsg(result.grade)}
            </p>
            {/* Stat dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <StatDot color="#4ade80" value={pass} label="passed" />
              {warn > 0 && <StatDot color="#fbbf24" value={warn} label={`warning${warn > 1 ? 's' : ''}`} />}
              {err  > 0 && <StatDot color="#f87171" value={err}  label={`error${err  > 1 ? 's' : ''}`}  />}
              <StatDot color="var(--text-muted)" value={result.fetchTime} label="ms" />
            </div>
          </div>

          {/* Actions + URL */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <a href={result.url} target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                <IconExternal />
                Open
              </a>
              <button onClick={exportJSON} className="btn btn-secondary">
                <IconDownload />
                JSON
              </button>
              <button onClick={share} className="btn btn-secondary">
                {copied ? <IconCheck /> : <IconShare />}
                {copied ? 'Copied' : 'Share'}
              </button>
            </div>
            <span className="mono" style={{
              fontSize: 10.5, color: 'var(--text-muted)',
              maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {formatUrl(result.url)}
            </span>
          </div>
        </div>

        {/* Category bars */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0 20px',
        }}>
          {cats.map(cat => (
            <div key={cat.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', letterSpacing: '-0.01em' }}>{cat.label}</span>
                <span className="mono" style={{ fontSize: 10, color: scoreColor(cat.pct) }}>
                  {cat.score}/{cat.max}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: animated ? `${cat.pct}%` : '0%',
                  background: scoreColor(cat.pct),
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs.Root value={tab} onValueChange={setTab}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          <Tabs.List style={{ display: 'flex', overflowX: 'auto' }}>
            {TABS.map(t => (
              <Tabs.Trigger
                key={t.id}
                value={t.id}
                className="tab-trigger"
                data-state={tab === t.id ? 'active' : 'inactive'}
              >
                {t.label}
                {t.count != null && (
                  <span style={{
                    marginLeft: 4, fontSize: 9.5, padding: '0 5px',
                    borderRadius: 3,
                    background: err > 0 ? 'var(--red-dim)' : 'var(--yellow-dim)',
                    color: err > 0 ? 'var(--red)' : 'var(--yellow)',
                    border: `1px solid ${err > 0 ? 'var(--red-border)' : 'var(--yellow-border)'}`,
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}>
                    {t.count}
                  </span>
                )}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        <Tabs.Content value="previews"><PreviewsTab result={result} /></Tabs.Content>
        <Tabs.Content value="basic"><IssuesList issues={result.issues} /></Tabs.Content>
        <Tabs.Content value="og"><OGTab result={result} /></Tabs.Content>
        <Tabs.Content value="twitter"><TwitterTab result={result} /></Tabs.Content>
        <Tabs.Content value="images"><ImagesTab result={result} /></Tabs.Content>
        <Tabs.Content value="raw"><RawData result={result} /></Tabs.Content>
        <Tabs.Content value="score"><OverviewTab result={result} /></Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatDot({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{value}</span> {label}
      </span>
    </div>
  );
}

function IconExternal() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, color: '#4ade80' }} fill="none" stroke="#4ade80" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── OG Tab ───────────────────────────────────────────────────────────────────
function OGTab({ result }: { result: AnalysisResult }) {
  const { og } = result;
  const rows = [
    ['og:title', og.title],
    ['og:description', og.description],
    ['og:image', og.image],
    ['og:image:alt', og.imageAlt],
    ['og:image:width', og.imageWidth],
    ['og:image:height', og.imageHeight],
    ['og:url', og.url],
    ['og:type', og.type],
    ['og:site_name', og.siteName],
    ['og:locale', og.locale],
  ] as [string, string | undefined][];

  return <MetaTable title="Open Graph" rows={rows} imageKey="og:image" />;
}

// ─── Twitter Tab ──────────────────────────────────────────────────────────────
function TwitterTab({ result }: { result: AnalysisResult }) {
  const { twitter } = result;
  const rows = [
    ['twitter:card', twitter.card],
    ['twitter:title', twitter.title],
    ['twitter:description', twitter.description],
    ['twitter:image', twitter.image],
    ['twitter:image:alt', twitter.imageAlt],
    ['twitter:site', twitter.site],
    ['twitter:creator', twitter.creator],
  ] as [string, string | undefined][];

  return <MetaTable title="Twitter / X Card" rows={rows} imageKey="twitter:image" />;
}

function MetaTable({ title, rows, imageKey }: { title: string; rows: [string, string | undefined][]; imageKey: string }) {
  const found  = rows.filter(([, v]) => v);
  const missing = rows.filter(([, v]) => !v);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="section-label">{title}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {found.length} found · {missing.length} missing
          </span>
        </div>
        {found.length === 0
          ? <div style={{ padding: '36px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>No tags found</div>
          : found.map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', borderBottom: i < found.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ width: 190, flexShrink: 0, padding: '10px 16px', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{k}</span>
              </div>
              <div style={{ flex: 1, padding: '10px 16px', overflow: 'hidden' }}>
                {k === imageKey ? (
                  <div>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{v}</span>
                    <img src={v} alt="" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 5, border: '1px solid var(--border)', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ) : (
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-secondary)', wordBreak: 'break-all', lineHeight: 1.6 }}>{v}</span>
                )}
              </div>
            </div>
          ))
        }
      </div>

      {missing.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            <span className="section-label" style={{ color: 'var(--red)' }}>Missing</span>
          </div>
          {missing.map(([k], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: i < missing.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--red)', opacity: 0.5, flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{k}</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 4 }}>not found</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Images Tab ───────────────────────────────────────────────────────────────
function ImagesTab({ result }: { result: AnalysisResult }) {
  const { images, og, twitter } = result;
  const url = og.image || twitter.image;

  if (!url) return (
    <div style={{ padding: '60px 16px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>No og:image found</div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Add og:image to enable rich link previews</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="section-label">og:image</span>
          {images.valid !== undefined && (
            <span className={`badge ${images.valid ? 'badge-success' : 'badge-warning'}`}>
              {images.valid ? 'Optimal ratio' : 'Suboptimal ratio'}
            </span>
          )}
        </div>
        <div style={{ padding: 16, background: '#090909' }}>
          <img src={url} alt={og.imageAlt || ''}
            style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 5, display: 'block', border: '1px solid var(--border)' }}
            onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="padding:40px;text-align:center;font-size:12px;color:var(--text-muted)">Failed to load image</div>'; }} />
        </div>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <span className="section-label">Metadata</span>
        </div>
        {[
          ['URL', url],
          ['Alt Text', og.imageAlt || '—'],
          ['Width', images.width ? `${images.width}px` : '—'],
          ['Height', images.height ? `${images.height}px` : '—'],
          ['Aspect Ratio', images.aspectRatio ? `${images.aspectRatio.toFixed(2)}:1` : '—'],
          ['Recommended', '1200 × 630px (1.91:1)'],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: 'flex', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ width: 130, flexShrink: 0, padding: '9px 16px', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{k}</span>
            </div>
            <div style={{ flex: 1, padding: '9px 16px', overflow: 'hidden' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useRef, useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { GooglePreview } from '@/components/previews/GooglePreview';
import { TwitterPreview } from '@/components/previews/TwitterPreview';
import { LinkedInPreview } from '@/components/previews/LinkedInPreview';
import { DiscordPreview } from '@/components/previews/DiscordPreview';
import { SlackPreview } from '@/components/previews/SlackPreview';
import { WhatsAppPreview } from '@/components/previews/WhatsAppPreview';
import { TelegramPreview } from '@/components/previews/TelegramPreview';
import { FacebookPreview } from '@/components/previews/FacebookPreview';
import { IMessagePreview } from '@/components/previews/iMessagePreview';

interface Props { result: AnalysisResult }

const PLATFORMS = [
  {
    id: 'google', label: 'Google Search',
    meta: 'title + meta description',
    check: (r: AnalysisResult) => !!(r.meta.title && r.meta.description),
  },
  {
    id: 'twitter', label: 'X / Twitter',
    meta: 'twitter:card + og:image',
    check: (r: AnalysisResult) => !!(r.twitter.card && (r.twitter.image || r.og.image)),
  },
  {
    id: 'linkedin', label: 'LinkedIn',
    meta: 'og:title + og:image',
    check: (r: AnalysisResult) => !!(r.og.title && r.og.image),
  },
  {
    id: 'discord', label: 'Discord',
    meta: 'og:title + og:description',
    check: (r: AnalysisResult) => !!(r.og.title && r.og.description),
  },
  {
    id: 'slack', label: 'Slack',
    meta: 'og:title + og:site_name',
    check: (r: AnalysisResult) => !!r.og.title,
  },
  {
    id: 'whatsapp', label: 'WhatsApp',
    meta: 'og:title + og:image',
    check: (r: AnalysisResult) => !!(r.og.title && r.og.image),
  },
  {
    id: 'telegram', label: 'Telegram',
    meta: 'og:title + og:image',
    check: (r: AnalysisResult) => !!(r.og.title && r.og.image),
  },
  {
    id: 'facebook', label: 'Facebook',
    meta: 'og:title + og:image',
    check: (r: AnalysisResult) => !!(r.og.title && r.og.image),
  },
  {
    id: 'imessage', label: 'iMessage',
    meta: 'og:title + og:image',
    check: (r: AnalysisResult) => !!(r.og.title && r.og.image),
  },
] as const;

type PlatformId = typeof PLATFORMS[number]['id'];

const FILTERS: { id: PlatformId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'google', label: 'Google' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'discord', label: 'Discord' },
  { id: 'slack', label: 'Slack' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'imessage', label: 'iMessage' },
];

export function PreviewsTab({ result }: Props) {
  const [active, setActive] = useState<PlatformId | 'all'>('all');
  const [exporting, setExporting] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const exportPng = async (id: string) => {
    const el = refs.current[id];
    if (!el) return;
    setExporting(id);
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(el, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.download = `metaxv-${id}.png`;
      a.href = url;
      a.click();
    } catch (e) { console.error(e); }
    finally { setExporting(null); }
  };

  const render = (id: PlatformId) => {
    switch (id) {
      case 'google':   return <GooglePreview result={result} />;
      case 'twitter':  return <TwitterPreview result={result} />;
      case 'linkedin': return <LinkedInPreview result={result} />;
      case 'discord':  return <DiscordPreview result={result} />;
      case 'slack':    return <SlackPreview result={result} />;
      case 'whatsapp': return <WhatsAppPreview result={result} />;
      case 'telegram': return <TelegramPreview result={result} />;
      case 'facebook': return <FacebookPreview result={result} />;
      case 'imessage': return <IMessagePreview result={result} />;
    }
  };

  const visible = active === 'all'
    ? PLATFORMS
    : PLATFORMS.filter(p => p.id === active);

  const cols = active === 'all' ? 3 : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filter row — flat text tabs */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--border-subtle)',
        overflowX: 'auto',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            style={{
              padding: '7px 12px',
              fontSize: 11.5,
              fontWeight: 500,
              color: active === f.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: 'none',
              border: 'none',
              borderBottom: active === f.id ? '1px solid var(--text-primary)' : '1px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => { if (active !== f.id) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (active !== f.id) (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12,
      }}>
        {visible.map(platform => {
          const ok = platform.check(result);
          return (
            <div
              key={platform.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {/* Left: name + badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {platform.label}
                  </span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 500, padding: '1px 6px', borderRadius: 3,
                    background: ok ? 'var(--green-dim)' : 'var(--yellow-dim)',
                    color: ok ? 'var(--green-muted)' : 'var(--yellow)',
                    border: `1px solid ${ok ? 'var(--green-border)' : 'var(--yellow-border)'}`,
                  }}>
                    {ok ? 'Perfect' : 'Partial'}
                  </span>
                </div>

                {/* Right: meta label + export */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                    {platform.meta}
                  </span>
                  <button
                    onClick={() => exportPng(platform.id)}
                    disabled={exporting === platform.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '2px 7px', borderRadius: 4,
                      fontSize: 10.5, color: 'var(--text-muted)',
                      background: 'none', border: '1px solid var(--border)',
                      cursor: 'pointer', opacity: exporting === platform.id ? 0.4 : 1,
                      transition: 'color 0.12s, border-color 0.12s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 9, height: 9 }} fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    PNG
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div ref={el => { refs.current[platform.id] = el; }} style={{ flex: 1 }}>
                {render(platform.id)}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
        Previews approximate platform rendering — actual display may vary.
      </p>
    </div>
  );
}

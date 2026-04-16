'use client';
import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Copy, Check } from 'lucide-react';

type S = 'meta' | 'og' | 'twitter' | 'full';

export function RawData({ result }: { result: AnalysisResult }) {
  const [section, setSection] = useState<S>('og');
  const [copied, setCopied] = useState(false);

  const data =
    section === 'meta' ? result.meta :
    section === 'og' ? result.og :
    section === 'twitter' ? result.twitter :
    (() => { const { rawHtml: _, ...r } = result as typeof result & { rawHtml?: string }; return r; })();

  const content = JSON.stringify(data, null, 2);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections: { k: S; label: string }[] = [
    { k: 'meta', label: 'Meta' },
    { k: 'og', label: 'Open Graph' },
    { k: 'twitter', label: 'Twitter' },
    { k: 'full', label: 'Full JSON' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex',
        padding: 2,
        borderRadius: 8,
        background: '#111',
        border: '1px solid #1e1e1e',
        width: 'fit-content',
        gap: 2,
      }}>
        {sections.map(s => (
          <button
            key={s.k}
            onClick={() => setSection(s.k)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              background: section === s.k ? '#1e1e1e' : 'transparent',
              color: section === s.k ? '#ededed' : '#444',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div style={{ borderRadius: 12, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid #1a1a1a',
          background: '#0d0d0d',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#333' }}>{section}.json</span>
          <button
            onClick={copy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              color: copied ? '#4ade80' : '#555',
              background: 'transparent',
              border: '1px solid #1e1e1e',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div style={{ maxHeight: 400, overflow: 'auto', background: '#0a0a0a' }}>
          <pre style={{
            padding: 16,
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#666',
            lineHeight: 1.6,
            margin: 0,
          }}>{content}</pre>
        </div>
      </div>

      {/* Summary table */}
      <div style={{ borderRadius: 12, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid #1a1a1a',
          background: '#0d0d0d',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#333' }}>analysis summary</span>
        </div>
        <div>
          {[
            ['URL', result.url],
            ['Fetch Time', `${result.fetchTime}ms`],
            ['Score', `${result.score}/100`],
            ['Grade', result.grade],
            ['Issues', `${result.issues.filter(i => !i.passed).length} / ${result.issues.length}`],
            ['og:image', result.og.image || '—'],
            ['Dimensions', result.images.width && result.images.height ? `${result.images.width} × ${result.images.height}` : '—'],
          ].map(([k, v], idx, arr) => (
            <div
              key={k}
              style={{
                display: 'flex',
                gap: 16,
                padding: '10px 16px',
                borderBottom: idx < arr.length - 1 ? '1px solid #111' : 'none',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#444', width: 96, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

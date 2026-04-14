'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function GooglePreview({ result }: { result: AnalysisResult }) {
  const title  = result.meta.title || result.og.title || 'Untitled Page';
  const desc   = result.meta.description || result.og.description || '';
  const domain = formatUrl(result.url);
  const favicon = `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=32`;

  return (
    <div style={{ padding: '16px 18px', background: '#1c1c1e', fontFamily: 'arial,sans-serif', minHeight: 120 }}>
      {/* Breadcrumb row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <img src={favicon} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div>
          <div style={{ fontSize: 13, color: '#e8eaed', lineHeight: 1.2 }}>{domain}</div>
          <div style={{ fontSize: 11, color: '#9aa0a6' }}>{result.url.length > 60 ? result.url.slice(0, 60) + '…' : result.url}</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 18, color: '#8ab4f8', lineHeight: 1.3, marginBottom: 4, fontWeight: 400, cursor: 'pointer' }}>
        {truncate(title, 60)}
        {title.length > 60 && (
          <span style={{ fontSize: 11, color: '#e37400', marginLeft: 8, fontFamily: 'arial', fontWeight: 400 }}>
            truncated
          </span>
        )}
      </div>

      {/* Snippet */}
      <div style={{ fontSize: 13, color: '#bdc1c6', lineHeight: 1.55 }}>
        {desc
          ? truncate(desc, 155)
          : <span style={{ color: '#5f6368', fontStyle: 'italic' }}>No meta description found.</span>
        }
      </div>
    </div>
  );
}

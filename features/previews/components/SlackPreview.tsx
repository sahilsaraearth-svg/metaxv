'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function SlackPreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title    = og.title || meta.title || 'Untitled';
  const desc     = og.description || meta.description || '';
  const image    = og.image;
  const siteName = og.siteName || formatUrl(result.url);

  return (
    <div style={{ background: '#1a1d21', padding: '16px 18px', fontFamily: 'Lato,"Helvetica Neue",Arial,sans-serif' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 6, background: '#4a154b', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>U</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'baseline' }}>
            <span style={{ color: '#e8e8e8', fontSize: 14, fontWeight: 900 }}>username</span>
            <span style={{ color: '#868686', fontSize: 11 }}>12:34 PM</span>
          </div>
          <div style={{ color: '#1d9bf0', fontSize: 13, marginBottom: 6, wordBreak: 'break-all' }}>
            {result.url.length > 50 ? result.url.slice(0, 50) + '…' : result.url}
          </div>
          {/* Unfurl */}
          <div style={{ borderLeft: '4px solid #e01e5a', paddingLeft: 10, paddingTop: 4, paddingBottom: 6 }}>
            <div style={{ color: '#1d9bf0', fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{siteName}</div>
            <div style={{ color: '#1264a3', fontSize: 14, fontWeight: 700, marginBottom: desc ? 3 : 0 }}>{truncate(title, 70)}</div>
            {desc && <div style={{ color: '#d1d2d3', fontSize: 13, lineHeight: '18px', marginBottom: image ? 6 : 0 }}>{truncate(desc, 160)}</div>}
            {image && (
              <img src={image} alt={og.imageAlt || title}
                style={{ borderRadius: 4, maxWidth: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

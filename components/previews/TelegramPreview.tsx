'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function TelegramPreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title  = og.title || meta.title || 'Untitled';
  const desc   = og.description || meta.description || '';
  const image  = og.image;
  const domain = formatUrl(result.url);

  return (
    <div style={{ background: '#17212b', padding: '16px 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: '#2b5278', borderRadius: '12px 12px 4px 12px', maxWidth: 300, overflow: 'hidden' }}>
          {image && (
            <img src={image} alt={og.imageAlt || title}
              style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div style={{ borderLeft: '3px solid #6ab3f3', margin: 8, paddingLeft: 8 }}>
            <div style={{ color: '#6ab3f3', fontSize: 12, fontWeight: 600, marginBottom: 1 }}>{domain}</div>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 500, lineHeight: '15px' }}>{truncate(title, 55)}</div>
            {desc && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2, lineHeight: '14px' }}>{truncate(desc, 70)}</div>}
          </div>
          <div style={{ padding: '2px 10px 7px', textAlign: 'right' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>12:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

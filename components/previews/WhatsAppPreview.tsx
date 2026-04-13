'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function WhatsAppPreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title  = og.title || meta.title || 'Untitled';
  const desc   = og.description || meta.description || '';
  const image  = og.image;
  const domain = formatUrl(result.url);

  return (
    <div style={{ background: '#0b141a', padding: '16px 18px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: '#005c4b', borderRadius: '12px 0 12px 12px', maxWidth: 300, overflow: 'hidden' }}>
          {/* Preview card */}
          <div style={{ background: '#025144', borderLeft: '4px solid #25d366', margin: 6, borderRadius: 5, overflow: 'hidden' }}>
            {image && (
              <img src={image} alt={og.imageAlt || title}
                style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div style={{ padding: '7px 10px 8px' }}>
              <div style={{ color: '#25d366', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{domain}</div>
              <div style={{ color: '#e9edef', fontSize: 12, fontWeight: 500, lineHeight: '15px' }}>{truncate(title, 55)}</div>
              {desc && <div style={{ color: '#8696a0', fontSize: 11, marginTop: 2, lineHeight: '14px' }}>{truncate(desc, 70)}</div>}
            </div>
          </div>
          {/* Message */}
          <div style={{ padding: '2px 10px 7px', color: '#e9edef', fontSize: 13 }}>
            <span style={{ color: '#53bdeb', fontSize: 12, wordBreak: 'break-all' }}>
              {result.url.length > 36 ? result.url.slice(0, 36) + '…' : result.url}
            </span>
            <span style={{ float: 'right', color: 'rgba(233,237,239,0.5)', fontSize: 10, marginLeft: 8, marginTop: 2 }}>12:00 ✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

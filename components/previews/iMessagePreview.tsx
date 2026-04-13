'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function IMessagePreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title  = og.title || meta.title || 'Untitled';
  const desc   = og.description || meta.description || '';
  const image  = og.image;
  const domain = formatUrl(result.url);

  return (
    <div style={{ background: '#1c1c1e', padding: '16px 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ maxWidth: 272, background: '#0a7cff', borderRadius: '18px 18px 4px 18px', overflow: 'hidden' }}>
          {/* Link preview block */}
          <div style={{ background: '#f2f2f7', overflow: 'hidden' }}>
            {image && (
              <img src={image} alt={og.imageAlt || title}
                style={{ width: '100%', maxHeight: 130, objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div style={{ padding: '7px 11px 9px', background: '#e5e5ea' }}>
              <div style={{ color: '#8e8e93', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 1 }}>{domain}</div>
              <div style={{ color: '#000', fontSize: 12, fontWeight: 600, lineHeight: '15px' }}>{truncate(title, 50)}</div>
              {desc && <div style={{ color: '#3c3c43', fontSize: 11, marginTop: 2, lineHeight: '14px' }}>{truncate(desc, 65)}</div>}
            </div>
          </div>
          {/* Message */}
          <div style={{ padding: '5px 11px 8px', color: '#fff', fontSize: 14, wordBreak: 'break-all' }}>
            {result.url.length > 32 ? result.url.slice(0, 32) + '…' : result.url}
          </div>
        </div>
        <div style={{ color: '#636366', fontSize: 10 }}>Delivered</div>
      </div>
    </div>
  );
}

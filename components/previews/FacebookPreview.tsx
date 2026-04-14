'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function FacebookPreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title  = og.title || meta.title || 'Untitled';
  const desc   = og.description || meta.description || '';
  const image  = og.image;
  const domain = formatUrl(result.url);

  return (
    <div style={{ background: '#18191a', padding: '16px 18px', fontFamily: 'system-ui,-apple-system,"Segoe UI",sans-serif' }}>
      {/* Post header */}
      <div style={{ display: 'flex', gap: 9, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#3a3b3c', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e4e6eb', fontWeight: 700, fontSize: 14 }}>U</div>
        <div>
          <div style={{ color: '#e4e6eb', fontSize: 13, fontWeight: 600 }}>Your Name</div>
          <div style={{ color: '#b0b3b8', fontSize: 11 }}>Just now · 🌐</div>
        </div>
      </div>
      {/* Link card */}
      <div style={{ border: '1px solid #3e4042', borderRadius: 6, overflow: 'hidden' }}>
        {image
          ? <img src={image} alt={og.imageAlt || title}
              style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
          : <div style={{ aspectRatio: '1.91/1', background: '#3a3b3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#6a6a6a', fontSize: 12 }}>No og:image</span>
            </div>
        }
        <div style={{ padding: '8px 12px 10px', background: '#3a3b3c' }}>
          <div style={{ color: '#b0b3b8', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{domain}</div>
          <div style={{ color: '#e4e6eb', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{truncate(title, 60)}</div>
          {desc && <div style={{ color: '#b0b3b8', fontSize: 12, lineHeight: '15px' }}>{truncate(desc, 90)}</div>}
        </div>
      </div>
    </div>
  );
}

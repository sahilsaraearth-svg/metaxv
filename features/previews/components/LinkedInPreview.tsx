'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function LinkedInPreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title  = og.title || meta.title || 'Untitled';
  const desc   = og.description || meta.description || '';
  const image  = og.image;
  const domain = formatUrl(result.url);

  return (
    <div style={{ background: '#1b1f23', padding: '16px 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Post header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2d3748', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: 16, fontWeight: 700 }}>U</div>
        <div>
          <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Your Name</div>
          <div style={{ color: '#718096', fontSize: 11 }}>Your Headline · 1st</div>
        </div>
      </div>
      {/* Link card */}
      <div style={{ border: '1px solid #2d3748', borderRadius: 6, overflow: 'hidden', background: '#141a21' }}>
        {image
          ? <img src={image} alt={og.imageAlt || title}
              style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
          : <div style={{ width: '100%', aspectRatio: '1.91/1', background: '#1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4a5568', fontSize: 12 }}>No og:image</span>
            </div>
        }
        <div style={{ padding: '8px 12px 10px', background: '#EDF3F8' }}>
          <div style={{ color: 'rgba(0,0,0,0.88)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{truncate(title, 65)}</div>
          {desc && <div style={{ color: 'rgba(0,0,0,0.55)', fontSize: 11, lineHeight: '15px', marginBottom: 3 }}>{truncate(desc, 100)}</div>}
          <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{domain}</div>
        </div>
      </div>
    </div>
  );
}

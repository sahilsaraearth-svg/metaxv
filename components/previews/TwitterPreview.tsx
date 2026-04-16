'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function TwitterPreview({ result }: { result: AnalysisResult }) {
  const { og, twitter, meta } = result;
  const card   = twitter.card || 'summary_large_image';
  const title  = twitter.title || og.title || meta.title || 'Untitled';
  const desc   = twitter.description || og.description || meta.description || '';
  const image  = twitter.image || og.image;
  const domain = new URL(result.url).hostname;
  const large  = card !== 'summary';

  return (
    <div style={{ background: '#000', padding: '16px 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Avatar */}
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1e2124', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* User */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e7e9ea' }}>User</span>
            <span style={{ fontSize: 13, color: '#536471' }}>@username · 2m</span>
          </div>
          {/* Tweet */}
          <div style={{ fontSize: 14, color: '#e7e9ea', marginBottom: 10, lineHeight: '20px' }}>
            Check this out <span style={{ color: '#1d9bf0' }}>{domain}</span>
          </div>
          {/* Card */}
          <div style={{ borderRadius: 14, border: '1px solid #2f3336', overflow: 'hidden' }}>
            {large ? (
              <>
                {image
                  ? <img src={image} alt={og.imageAlt || title}
                      style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  : <div style={{ width: '100%', aspectRatio: '1.91/1', background: '#16181c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#536471', fontSize: 12 }}>No og:image</span>
                    </div>
                }
                <div style={{ padding: '10px 14px 12px', background: '#16181c' }}>
                  <div style={{ color: '#536471', fontSize: 12, marginBottom: 2 }}>{domain}</div>
                  <div style={{ color: '#e7e9ea', fontSize: 14, lineHeight: '18px' }}>{truncate(title, 55)}</div>
                  {desc && <div style={{ color: '#536471', fontSize: 12, marginTop: 2 }}>{truncate(desc, 100)}</div>}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', background: '#16181c', padding: 12, gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#536471', fontSize: 12 }}>{domain}</div>
                  <div style={{ color: '#e7e9ea', fontSize: 14 }}>{truncate(title, 45)}</div>
                  {desc && <div style={{ color: '#536471', fontSize: 12, marginTop: 2 }}>{truncate(desc, 70)}</div>}
                </div>
                {image
                  ? <img src={image} alt="" style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  : <div style={{ width: 68, height: 68, background: '#2f3336', borderRadius: 10, flexShrink: 0 }} />
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

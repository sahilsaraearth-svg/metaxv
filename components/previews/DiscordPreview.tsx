'use client';
import type { AnalysisResult } from '@/lib/types';
import { truncate, formatUrl } from '@/lib/utils';

export function DiscordPreview({ result }: { result: AnalysisResult }) {
  const { og, meta } = result;
  const title    = og.title || meta.title || 'Untitled';
  const desc     = og.description || meta.description || '';
  const image    = og.image;
  const siteName = og.siteName || formatUrl(result.url);

  return (
    <div style={{ background: '#313338', padding: '16px 18px', fontFamily: '"gg sans","Noto Sans",sans-serif' }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#5865f2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>U</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'baseline' }}>
            <span style={{ color: '#f2f3f5', fontSize: 14, fontWeight: 500 }}>Username</span>
            <span style={{ color: '#949ba4', fontSize: 11 }}>Today at 12:34 PM</span>
          </div>
          <div style={{ color: '#00b0f4', fontSize: 13, marginBottom: 6, wordBreak: 'break-all' }}>
            {result.url.length > 50 ? result.url.slice(0, 50) + '…' : result.url}
          </div>
          {/* Embed */}
          <div style={{ borderLeft: '4px solid #5865f2', background: '#2b2d31', borderRadius: '0 4px 4px 0', padding: '8px 12px 12px', maxWidth: 400 }}>
            <div style={{ color: '#00b0f4', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{siteName}</div>
            <div style={{ color: '#00b0f4', fontSize: 14, fontWeight: 600, marginBottom: desc ? 4 : 0 }}>{truncate(title, 60)}</div>
            {desc && <div style={{ color: '#dbdee1', fontSize: 13, lineHeight: '17px', marginBottom: image ? 10 : 0 }}>{truncate(desc, 160)}</div>}
            {image && (
              <img src={image} alt={og.imageAlt || title}
                style={{ borderRadius: 4, maxWidth: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

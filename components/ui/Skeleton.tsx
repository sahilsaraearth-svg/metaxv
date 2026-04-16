'use client';

export function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={style} />;
}

export function ResultsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Score card skeleton */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <Skeleton style={{ width: 92, height: 92, borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton style={{ height: 14, width: 280 }} />
            <Skeleton style={{ height: 11, width: 180 }} />
            <Skeleton style={{ height: 11, width: 140 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[60, 56, 64].map((w, i) => <Skeleton key={i} style={{ height: 28, width: w, borderRadius: 6 }} />)}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0 20px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <Skeleton style={{ height: 10, width: 48 }} />
                <Skeleton style={{ height: 10, width: 24 }} />
              </div>
              <Skeleton style={{ height: 2, width: '100%', borderRadius: 9999 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        {[64, 48, 72, 60, 48, 36, 44].map((w, i) => (
          <Skeleton key={i} style={{ height: 30, width: w, margin: '0 4px 0', borderRadius: 4 }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)' }}>
            <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Skeleton style={{ height: 11, width: 80 }} />
              <Skeleton style={{ height: 16, width: 44, borderRadius: 3 }} />
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton style={{ height: 80 }} />
              <Skeleton style={{ height: 11, width: '80%' }} />
              <Skeleton style={{ height: 11, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

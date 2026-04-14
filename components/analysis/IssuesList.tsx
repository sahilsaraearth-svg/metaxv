'use client';
import { useState } from 'react';
import type { ValidationIssue, Severity } from '@/lib/types';

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const [open, setOpen] = useState(false);

  const severityColor = issue.severity === 'error' ? '#f87171' : issue.severity === 'warning' ? '#eab308' : '#60a5fa';
  const borderColor = issue.passed ? '#1a1a1a' :
    issue.severity === 'error' ? 'rgba(248,113,113,0.15)' :
    issue.severity === 'warning' ? 'rgba(234,179,8,0.15)' : 'rgba(96,165,250,0.12)';
  const bgColor = issue.passed ? 'transparent' :
    issue.severity === 'error' ? 'rgba(248,113,113,0.02)' :
    issue.severity === 'warning' ? 'rgba(234,179,8,0.02)' : 'rgba(96,165,250,0.02)';

  const IconCheck = () => (
    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, color: '#22c55e', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
  const IconX = () => (
    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
  const IconWarn = () => (
    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, color: '#eab308', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
  const IconInfo = () => (
    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, color: '#60a5fa', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );

  return (
    <div style={{ border: `1px solid ${borderColor}`, borderRadius: 10, overflow: 'hidden', background: bgColor }}>
      <button
        onClick={() => !issue.passed && setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', background: 'none', border: 'none',
          cursor: issue.passed ? 'default' : 'pointer', textAlign: 'left',
        }}
      >
        {issue.passed ? <IconCheck /> : issue.severity === 'error' ? <IconX /> : issue.severity === 'warning' ? <IconWarn /> : <IconInfo />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: issue.passed ? '#555' : '#ccc', marginBottom: 2 }}>{issue.title}</div>
          {!open && <div style={{ fontSize: 11, color: '#444', lineHeight: 1.4 }}>{issue.description}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!issue.passed && (
            <span className="badge" style={{
              fontSize: 10,
              color: severityColor,
              background: `${severityColor}12`,
              borderColor: `${severityColor}22`,
            }}>
              {issue.severity}
            </span>
          )}
          {issue.passed && <span className="badge badge-success" style={{ fontSize: 10 }}>pass</span>}
          {!issue.passed && (
            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, color: '#333', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </button>

      {open && !issue.passed && (
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{issue.description}</p>
          <div className="code-block">
            <div style={{ padding: '8px 14px 0', fontSize: 10, color: '#444', fontFamily: 'monospace' }}>fix suggestion</div>
            <pre>{issue.fixSuggestion}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

type Filter = Severity | 'all' | 'pass';

export function IssuesList({ issues }: { issues: ValidationIssue[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = {
    all: issues.length,
    error: issues.filter(i => !i.passed && i.severity === 'error').length,
    warning: issues.filter(i => !i.passed && i.severity === 'warning').length,
    info: issues.filter(i => !i.passed && i.severity === 'info').length,
    pass: issues.filter(i => i.passed).length,
  };

  const sorted = [...issues].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return ['error', 'warning', 'info'].indexOf(a.severity) - ['error', 'warning', 'info'].indexOf(b.severity);
  });

  const visible = filter === 'all' ? sorted
    : filter === 'pass' ? sorted.filter(i => i.passed)
    : sorted.filter(i => !i.passed && i.severity === filter);

  const filters: { key: Filter; label: string; color: string }[] = [
    { key: 'all', label: `All · ${counts.all}`, color: '#ededed' },
    { key: 'error', label: `Errors · ${counts.error}`, color: '#f87171' },
    { key: 'warning', label: `Warnings · ${counts.warning}`, color: '#eab308' },
    { key: 'info', label: `Info · ${counts.info}`, color: '#60a5fa' },
    { key: 'pass', label: `Passed · ${counts.pass}`, color: '#22c55e' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="mono"
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: filter === f.key ? '#1a1a1a' : 'transparent',
              color: filter === f.key ? f.color : '#444',
              borderColor: filter === f.key ? '#2a2a2a' : '#1a1a1a',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.length === 0
          ? <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: '#444' }}>No issues in this category</div>
          : visible.map(i => <IssueRow key={i.id} issue={i} />)
        }
      </div>
    </div>
  );
}

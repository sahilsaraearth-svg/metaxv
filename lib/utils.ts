import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string | undefined, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function formatUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url;
  }
}

export function formatScore(score: number): string {
  return `${Math.round(score)}`;
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#84cc16';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#71717a';
  }
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'error': return '#ef4444';
    case 'warning': return '#eab308';
    case 'info': return '#3b82f6';
    default: return '#71717a';
  }
}

export function severityBg(severity: string): string {
  switch (severity) {
    case 'error': return 'rgba(239,68,68,0.1)';
    case 'warning': return 'rgba(234,179,8,0.1)';
    case 'info': return 'rgba(59,130,246,0.1)';
    default: return 'rgba(113,113,122,0.1)';
  }
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

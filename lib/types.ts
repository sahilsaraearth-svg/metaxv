export interface MetaData {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  author?: string;
  keywords?: string;
  themeColor?: string;
}

export interface OGData {
  title?: string;
  description?: string;
  image?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  video?: string;
}

export interface TwitterData {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  site?: string;
  creator?: string;
}

export interface ImageInfo {
  url?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  valid?: boolean;
}

export interface AnalysisResult {
  url: string;
  fetchTime: number;
  meta: MetaData;
  og: OGData;
  twitter: TwitterData;
  images: ImageInfo;
  score: number;
  grade: Grade;
  issues: ValidationIssue[];
  suggestions: Suggestion[];
  rawHtml?: string;
}

export type Severity = 'error' | 'warning' | 'info';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ValidationIssue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  fixSuggestion: string;
  passed: boolean;
  value?: string;
}

export interface Suggestion {
  id: string;
  title: string;
  html: string;
  nextjs: string;
  astro: string;
  severity: Severity;
}

export type Platform = 'google' | 'twitter' | 'linkedin' | 'slack' | 'whatsapp';

export interface AnalyzeRequest {
  url: string;
}

export interface HistoryItem {
  url: string;
  score: number;
  grade: Grade;
  timestamp: number;
  title?: string;
}

import type { MetaData, OGData, TwitterData, ValidationIssue, Severity } from './types';

interface ValidationContext {
  meta: MetaData;
  og: OGData;
  twitter: TwitterData;
}

interface ValidationRule {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  check: (ctx: ValidationContext) => boolean;
  getValue?: (ctx: ValidationContext) => string | undefined;
  fixSuggestion: string;
}

const rules: ValidationRule[] = [
  {
    id: 'og:title',
    title: 'Missing og:title',
    description: 'The og:title tag is required for rich social previews.',
    severity: 'error',
    check: (ctx) => !!ctx.og.title,
    getValue: (ctx) => ctx.og.title,
    fixSuggestion: 'Add <meta property="og:title" content="Your Page Title" />',
  },
  {
    id: 'og:description',
    title: 'Missing og:description',
    description: 'The og:description tag improves click-through rates on social platforms.',
    severity: 'warning',
    check: (ctx) => !!ctx.og.description,
    getValue: (ctx) => ctx.og.description,
    fixSuggestion: 'Add <meta property="og:description" content="A brief description of your page." />',
  },
  {
    id: 'og:image',
    title: 'Missing og:image',
    description: 'og:image is critical — posts without images get far less engagement.',
    severity: 'error',
    check: (ctx) => !!ctx.og.image,
    getValue: (ctx) => ctx.og.image,
    fixSuggestion: 'Add <meta property="og:image" content="https://yourdomain.com/og-image.png" />',
  },
  {
    id: 'og:url',
    title: 'Missing og:url',
    description: 'og:url specifies the canonical URL for sharing.',
    severity: 'warning',
    check: (ctx) => !!ctx.og.url,
    getValue: (ctx) => ctx.og.url,
    fixSuggestion: 'Add <meta property="og:url" content="https://yourdomain.com/page" />',
  },
  {
    id: 'og:type',
    title: 'Missing og:type',
    description: 'og:type tells platforms what kind of content this is (website, article, etc).',
    severity: 'info',
    check: (ctx) => !!ctx.og.type,
    getValue: (ctx) => ctx.og.type,
    fixSuggestion: 'Add <meta property="og:type" content="website" />',
  },
  {
    id: 'og:site_name',
    title: 'Missing og:site_name',
    description: 'og:site_name shows your brand name on social card previews.',
    severity: 'info',
    check: (ctx) => !!ctx.og.siteName,
    getValue: (ctx) => ctx.og.siteName,
    fixSuggestion: 'Add <meta property="og:site_name" content="Your Site Name" />',
  },
  {
    id: 'twitter:card',
    title: 'Missing twitter:card',
    description: 'twitter:card is required to enable rich Twitter/X card previews.',
    severity: 'error',
    check: (ctx) => !!ctx.twitter.card,
    getValue: (ctx) => ctx.twitter.card,
    fixSuggestion: 'Add <meta name="twitter:card" content="summary_large_image" />',
  },
  {
    id: 'twitter:title',
    title: 'Missing twitter:title',
    description: 'twitter:title is used when og:title is not present on Twitter/X.',
    severity: 'warning',
    check: (ctx) => !!(ctx.twitter.title || ctx.og.title),
    getValue: (ctx) => ctx.twitter.title || ctx.og.title,
    fixSuggestion: 'Add <meta name="twitter:title" content="Your Page Title" />',
  },
  {
    id: 'twitter:image',
    title: 'Missing twitter:image',
    description: 'twitter:image specifies the image for Twitter/X card previews.',
    severity: 'warning',
    check: (ctx) => !!(ctx.twitter.image || ctx.og.image),
    getValue: (ctx) => ctx.twitter.image || ctx.og.image,
    fixSuggestion: 'Add <meta name="twitter:image" content="https://yourdomain.com/twitter-image.png" />',
  },
  {
    id: 'meta:title',
    title: 'Missing <title> tag',
    description: 'The HTML <title> tag is required for SEO and browser tab display.',
    severity: 'error',
    check: (ctx) => !!ctx.meta.title,
    getValue: (ctx) => ctx.meta.title,
    fixSuggestion: 'Add <title>Your Page Title</title> to your <head>',
  },
  {
    id: 'meta:description',
    title: 'Missing meta description',
    description: 'Meta description appears in search engine results and improves CTR.',
    severity: 'warning',
    check: (ctx) => !!ctx.meta.description,
    getValue: (ctx) => ctx.meta.description,
    fixSuggestion: 'Add <meta name="description" content="A brief description of your page." />',
  },
  {
    id: 'title:length',
    title: 'Title too long',
    description: 'Titles over 60 characters get truncated in Google search results.',
    severity: 'warning',
    check: (ctx) => !ctx.meta.title || ctx.meta.title.length <= 60,
    getValue: (ctx) => ctx.meta.title ? `${ctx.meta.title.length} chars` : undefined,
    fixSuggestion: 'Keep your <title> under 60 characters for optimal display in search results.',
  },
  {
    id: 'description:length',
    title: 'Description too long',
    description: 'Descriptions over 160 characters get truncated in search results.',
    severity: 'warning',
    check: (ctx) => !ctx.meta.description || ctx.meta.description.length <= 160,
    getValue: (ctx) => ctx.meta.description ? `${ctx.meta.description.length} chars` : undefined,
    fixSuggestion: 'Keep your meta description under 160 characters.',
  },
  {
    id: 'og:title:length',
    title: 'og:title too long',
    description: 'og:title over 60 characters may be truncated on social platforms.',
    severity: 'info',
    check: (ctx) => !ctx.og.title || ctx.og.title.length <= 60,
    getValue: (ctx) => ctx.og.title ? `${ctx.og.title.length} chars` : undefined,
    fixSuggestion: 'Keep og:title under 60 characters for best display across all platforms.',
  },
  {
    id: 'og:description:length',
    title: 'og:description too long',
    description: 'og:description over 200 characters may be truncated.',
    severity: 'info',
    check: (ctx) => !ctx.og.description || ctx.og.description.length <= 200,
    getValue: (ctx) => ctx.og.description ? `${ctx.og.description.length} chars` : undefined,
    fixSuggestion: 'Keep og:description under 200 characters.',
  },
  {
    id: 'og:image:dimensions',
    title: 'og:image missing dimensions',
    description: 'Providing og:image:width and og:image:height helps platforms render faster.',
    severity: 'info',
    check: (ctx) => !ctx.og.image || !!(ctx.og.imageWidth && ctx.og.imageHeight),
    getValue: (ctx) => ctx.og.imageWidth && ctx.og.imageHeight ? `${ctx.og.imageWidth}x${ctx.og.imageHeight}` : undefined,
    fixSuggestion: 'Add <meta property="og:image:width" content="1200" /> and <meta property="og:image:height" content="630" />',
  },
  {
    id: 'og:image:alt',
    title: 'Missing og:image:alt',
    description: 'Image alt text improves accessibility for screen readers.',
    severity: 'info',
    check: (ctx) => !ctx.og.image || !!ctx.og.imageAlt,
    getValue: (ctx) => ctx.og.imageAlt,
    fixSuggestion: 'Add <meta property="og:image:alt" content="Description of your image" />',
  },
];

export function runValidation(ctx: ValidationContext): ValidationIssue[] {
  return rules.map((rule) => {
    const passed = rule.check(ctx);
    return {
      id: rule.id,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      fixSuggestion: rule.fixSuggestion,
      passed,
      value: rule.getValue?.(ctx),
    };
  });
}

export function calculateScore(issues: ValidationIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (!issue.passed) {
      if (issue.severity === 'error') score -= 10;
      else if (issue.severity === 'warning') score -= 5;
      else if (issue.severity === 'info') score -= 2;
    }
  }
  return Math.max(0, score);
}

export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

import type { ValidationIssue, Suggestion } from './types';

const codeTemplates: Record<string, { html: string; nextjs: string; astro: string }> = {
  'og:title': {
    html: `<meta property="og:title" content="Your Page Title" />`,
    nextjs: `// app/layout.tsx or app/page.tsx
export const metadata = {
  openGraph: {
    title: 'Your Page Title',
  },
};`,
    astro: `---
// src/pages/index.astro
---
<meta property="og:title" content="Your Page Title" />`,
  },
  'og:description': {
    html: `<meta property="og:description" content="A brief description of your page." />`,
    nextjs: `export const metadata = {
  openGraph: {
    description: 'A brief description of your page.',
  },
};`,
    astro: `<meta property="og:description" content="A brief description of your page." />`,
  },
  'og:image': {
    html: `<meta property="og:image" content="https://yourdomain.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`,
    nextjs: `export const metadata = {
  openGraph: {
    images: [{
      url: 'https://yourdomain.com/og-image.png',
      width: 1200,
      height: 630,
    }],
  },
};`,
    astro: `<meta property="og:image" content="https://yourdomain.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`,
  },
  'og:url': {
    html: `<meta property="og:url" content="https://yourdomain.com/page" />`,
    nextjs: `export const metadata = {
  openGraph: {
    url: 'https://yourdomain.com/page',
  },
};`,
    astro: `<meta property="og:url" content="https://yourdomain.com/page" />`,
  },
  'og:type': {
    html: `<meta property="og:type" content="website" />`,
    nextjs: `export const metadata = {
  openGraph: {
    type: 'website',
  },
};`,
    astro: `<meta property="og:type" content="website" />`,
  },
  'og:site_name': {
    html: `<meta property="og:site_name" content="Your Site Name" />`,
    nextjs: `export const metadata = {
  openGraph: {
    siteName: 'Your Site Name',
  },
};`,
    astro: `<meta property="og:site_name" content="Your Site Name" />`,
  },
  'twitter:card': {
    html: `<meta name="twitter:card" content="summary_large_image" />`,
    nextjs: `export const metadata = {
  twitter: {
    card: 'summary_large_image',
  },
};`,
    astro: `<meta name="twitter:card" content="summary_large_image" />`,
  },
  'twitter:title': {
    html: `<meta name="twitter:title" content="Your Page Title" />`,
    nextjs: `export const metadata = {
  twitter: {
    title: 'Your Page Title',
  },
};`,
    astro: `<meta name="twitter:title" content="Your Page Title" />`,
  },
  'twitter:image': {
    html: `<meta name="twitter:image" content="https://yourdomain.com/twitter-image.png" />`,
    nextjs: `export const metadata = {
  twitter: {
    images: ['https://yourdomain.com/twitter-image.png'],
  },
};`,
    astro: `<meta name="twitter:image" content="https://yourdomain.com/twitter-image.png" />`,
  },
  'meta:title': {
    html: `<title>Your Page Title</title>`,
    nextjs: `export const metadata = {
  title: 'Your Page Title',
};`,
    astro: `<title>Your Page Title</title>`,
  },
  'meta:description': {
    html: `<meta name="description" content="A brief description of your page." />`,
    nextjs: `export const metadata = {
  description: 'A brief description of your page.',
};`,
    astro: `<meta name="description" content="A brief description of your page." />`,
  },
  'title:length': {
    html: `<!-- Keep title under 60 chars -->
<title>Short Page Title</title>`,
    nextjs: `export const metadata = {
  // Keep title under 60 characters
  title: 'Short, Concise Title',
};`,
    astro: `<!-- Keep title under 60 chars -->
<title>Short Page Title</title>`,
  },
  'description:length': {
    html: `<!-- Keep description under 160 chars -->
<meta name="description" content="A concise description under 160 characters." />`,
    nextjs: `export const metadata = {
  // Keep description under 160 characters
  description: 'A concise description under 160 characters.',
};`,
    astro: `<meta name="description" content="A concise description under 160 characters." />`,
  },
  'og:image:dimensions': {
    html: `<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`,
    nextjs: `export const metadata = {
  openGraph: {
    images: [{
      url: '...',
      width: 1200,
      height: 630,
    }],
  },
};`,
    astro: `<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`,
  },
  'og:image:alt': {
    html: `<meta property="og:image:alt" content="Description of your image" />`,
    nextjs: `export const metadata = {
  openGraph: {
    images: [{
      url: '...',
      alt: 'Description of your image',
    }],
  },
};`,
    astro: `<meta property="og:image:alt" content="Description of your image" />`,
  },
};

export function generateSuggestions(issues: ValidationIssue[]): Suggestion[] {
  return issues
    .filter((issue) => !issue.passed && codeTemplates[issue.id])
    .map((issue) => {
      const tmpl = codeTemplates[issue.id];
      return {
        id: issue.id,
        title: issue.title,
        html: tmpl.html,
        nextjs: tmpl.nextjs,
        astro: tmpl.astro,
        severity: issue.severity,
      };
    });
}

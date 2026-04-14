import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { runValidation, calculateScore, scoreToGrade } from '@/lib/validation';
import { generateSuggestions } from '@/lib/suggestions';
import type { MetaData, OGData, TwitterData, ImageInfo, AnalysisResult } from '@/lib/types';

const schema = z.object({
  url: z.string().url('Invalid URL format'),
});

// Simple in-memory cache
const cache = new Map<string, { result: AnalysisResult; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid URL' },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ ...cached.result, cached: true });
    }

    const startTime = Date.now();

    // Fetch HTML
    let html: string;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; MetaXV/1.0; +https://metaxv.dev) Twitterbot/1.0 facebookexternalhit/1.1',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${res.status} ${res.statusText}` },
          { status: 422 }
        );
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('html')) {
        return NextResponse.json(
          { error: `URL does not return HTML content (got: ${contentType})` },
          { status: 422 }
        );
      }

      html = await res.text();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timed out after 10 seconds' }, { status: 408 });
      }
      return NextResponse.json(
        { error: `Network error: ${e instanceof Error ? e.message : 'Unknown error'}` },
        { status: 503 }
      );
    }

    // Parse with Cheerio
    const $ = cheerio.load(html);

    // Extract meta
    const meta: MetaData = {
      title: $('title').first().text().trim() || undefined,
      description: $('meta[name="description"]').attr('content')?.trim(),
      canonical: $('link[rel="canonical"]').attr('href')?.trim(),
      robots: $('meta[name="robots"]').attr('content')?.trim(),
      viewport: $('meta[name="viewport"]').attr('content')?.trim(),
      author: $('meta[name="author"]').attr('content')?.trim(),
      keywords: $('meta[name="keywords"]').attr('content')?.trim(),
      themeColor: $('meta[name="theme-color"]').attr('content')?.trim(),
    };

    // Extract OG
    const og: OGData = {
      title: $('meta[property="og:title"]').attr('content')?.trim(),
      description: $('meta[property="og:description"]').attr('content')?.trim(),
      image: $('meta[property="og:image"]').attr('content')?.trim(),
      imageWidth: $('meta[property="og:image:width"]').attr('content')?.trim(),
      imageHeight: $('meta[property="og:image:height"]').attr('content')?.trim(),
      imageAlt: $('meta[property="og:image:alt"]').attr('content')?.trim(),
      url: $('meta[property="og:url"]').attr('content')?.trim(),
      type: $('meta[property="og:type"]').attr('content')?.trim(),
      siteName: $('meta[property="og:site_name"]').attr('content')?.trim(),
      locale: $('meta[property="og:locale"]').attr('content')?.trim(),
      video: $('meta[property="og:video"]').attr('content')?.trim(),
    };

    // Extract Twitter
    const twitter: TwitterData = {
      card: ($('meta[name="twitter:card"]').attr('content') || $('meta[property="twitter:card"]').attr('content'))?.trim(),
      title: ($('meta[name="twitter:title"]').attr('content') || $('meta[property="twitter:title"]').attr('content'))?.trim(),
      description: ($('meta[name="twitter:description"]').attr('content') || $('meta[property="twitter:description"]').attr('content'))?.trim(),
      image: ($('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content'))?.trim(),
      imageAlt: ($('meta[name="twitter:image:alt"]').attr('content') || $('meta[property="twitter:image:alt"]').attr('content'))?.trim(),
      site: ($('meta[name="twitter:site"]').attr('content') || $('meta[property="twitter:site"]').attr('content'))?.trim(),
      creator: ($('meta[name="twitter:creator"]').attr('content') || $('meta[property="twitter:creator"]').attr('content'))?.trim(),
    };

    // Image info
    const imageUrl = og.image || twitter.image;
    const images: ImageInfo = {
      url: imageUrl,
      width: og.imageWidth ? parseInt(og.imageWidth) : undefined,
      height: og.imageHeight ? parseInt(og.imageHeight) : undefined,
    };

    if (images.width && images.height) {
      images.aspectRatio = images.width / images.height;
      // 1.91:1 is ideal for OG (1200x630)
      images.valid = images.aspectRatio >= 1.7 && images.aspectRatio <= 2.1;
    }

    const fetchTime = Date.now() - startTime;

    // Validate
    const issues = runValidation({ meta, og, twitter });
    const score = calculateScore(issues);
    const grade = scoreToGrade(score);
    const suggestions = generateSuggestions(issues);

    const result: AnalysisResult = {
      url,
      fetchTime,
      meta,
      og,
      twitter,
      images,
      score,
      grade,
      issues,
      suggestions,
    };

    // Cache result
    cache.set(url, { result, ts: Date.now() });

    // Trim cache if too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error('Analyze error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

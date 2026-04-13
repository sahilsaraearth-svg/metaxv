# metaxv

**Open Graph & Twitter Card Analyzer**

Paste any URL. Get a score, a grade, 17 validation checks, 9 realistic platform previews, and copy-paste fix code — all in under one second.

---

## What It Does

Most developers ship pages without checking how they look when shared on Slack, Twitter, or iMessage. metaxv fixes that. It:

1. Fetches the HTML of any URL server-side
2. Parses every `<meta>` tag with Cheerio
3. Runs 17 validation rules across 6 categories
4. Calculates a 0–100 score and A–F grade
5. Renders pixel-accurate previews of how the link looks on 9 platforms
6. Generates copy-paste fix code in HTML, Next.js, and Astro

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| HTML Parsing | Cheerio |
| Validation | Custom rule engine |
| State | Zustand (persisted) |
| Styling | CSS custom properties + inline styles |
| Fonts | Geist Sans + Geist Mono |
| Schema validation | Zod |
| UI primitives | Radix UI (Tabs, Accordion, Tooltip) |
| Image export | html-to-image |
| Type safety | TypeScript 5 |

---

## Project Structure

```
metaxv/
├── app/
│   ├── layout.tsx              # Root layout, fonts, global metadata
│   ├── page.tsx                # Home page — hero, input, results
│   ├── globals.css             # Design system: tokens, utilities, animations
│   └── api/
│       └── analyze/
│           └── route.ts        # POST /api/analyze — core server logic
│
├── components/
│   ├── URLInput.tsx            # Input field with history dropdown
│   ├── ResultsTabs.tsx         # Score card + category bars + tab shell
│   │
│   ├── analysis/
│   │   ├── ScoreRing.tsx       # Animated SVG ring with gradient arc
│   │   ├── OverviewTab.tsx     # Score tab — breakdown + tag presence
│   │   ├── IssuesList.tsx      # Basic tab — expandable issue rows
│   │   ├── PreviewsTab.tsx     # Previews tab — 9-platform grid
│   │   ├── FixSuggestions.tsx  # Fix code tab — HTML/Next.js/Astro snippets
│   │   └── RawData.tsx         # Raw tab — JSON viewer + summary table
│   │
│   ├── previews/
│   │   ├── GooglePreview.tsx   # Google Search result mock
│   │   ├── TwitterPreview.tsx  # X/Twitter card mock (large + summary)
│   │   ├── LinkedInPreview.tsx # LinkedIn post with link card
│   │   ├── DiscordPreview.tsx  # Discord embed card
│   │   ├── SlackPreview.tsx    # Slack unfurl card
│   │   ├── WhatsAppPreview.tsx # WhatsApp chat bubble with link preview
│   │   ├── TelegramPreview.tsx # Telegram chat bubble
│   │   ├── FacebookPreview.tsx # Facebook post with link card
│   │   └── iMessagePreview.tsx # iMessage bubble with rich link
│   │
│   └── ui/
│       ├── Skeleton.tsx        # Loading skeleton (full results layout)
│       ├── Badge.tsx           # Status badge component
│       ├── Button.tsx          # Button variants
│       └── Tooltip.tsx         # Radix tooltip wrapper
│
├── lib/
│   ├── types.ts                # All TypeScript interfaces
│   ├── validation.ts           # 17 validation rules + scoring + grading
│   ├── suggestions.ts          # Fix code templates per issue
│   └── utils.ts                # truncate, formatUrl, timeAgo, gradeColor
│
└── store/
    └── useAnalyzerStore.ts     # Zustand store — result, history, loading
```

---

## Core Data Flow

```
User types URL
     │
     ▼
URLInput.tsx
  validates format (must be http/https)
  calls POST /api/analyze
     │
     ▼
app/api/analyze/route.ts
  1. Validates request body with Zod
  2. Checks in-memory cache (5 min TTL, 100 entries max)
  3. Fetches HTML with User-Agent spoofing (Twitterbot + facebookexternalhit)
  4. Parses with Cheerio → extracts MetaData, OGData, TwitterData, ImageInfo
  5. Runs runValidation() → 17 ValidationIssue[]
  6. Runs calculateScore() → number
  7. Runs scoreToGrade() → Grade
  8. Runs generateSuggestions() → Suggestion[]
  9. Returns AnalysisResult JSON
     │
     ▼
useAnalyzerStore.ts
  setResult(data) — triggers re-render
  addToHistory(item) — persisted to localStorage
     │
     ▼
ResultsTabs.tsx
  renders score card + category bars + tab shell
     │
     ├── PreviewsTab   → 9 platform components
     ├── IssuesList    → expandable validation rows
     ├── OGTab         → og:* tag table
     ├── TwitterTab    → twitter:* tag table
     ├── ImagesTab     → image preview + metadata
     ├── RawData       → JSON viewer
     └── OverviewTab   → score breakdown + tag checklist
```

---

## API Endpoint

### `POST /api/analyze`

**Request body:**
```json
{ "url": "https://example.com" }
```

**Response:**
```ts
{
  url: string
  fetchTime: number           // milliseconds to fetch + parse
  meta: {
    title?: string
    description?: string
    canonical?: string
    robots?: string
    viewport?: string
    charset?: string
    author?: string
    keywords?: string
    themeColor?: string
  }
  og: {
    title?: string
    description?: string
    image?: string
    imageWidth?: string
    imageHeight?: string
    imageAlt?: string
    url?: string
    type?: string
    siteName?: string
    locale?: string
    video?: string
  }
  twitter: {
    card?: string
    title?: string
    description?: string
    image?: string
    imageAlt?: string
    site?: string
    creator?: string
  }
  images: {
    url?: string
    width?: number
    height?: number
    aspectRatio?: number      // width / height
    valid?: boolean           // true if 1.7 ≤ ratio ≤ 2.1 (optimal OG)
  }
  score: number               // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  issues: ValidationIssue[]
  suggestions: Suggestion[]
}
```

**Error responses:**
- `400` — invalid URL format
- `408` — fetch timed out (10s limit)
- `422` — URL returned non-HTML or HTTP error
- `503` — network error reaching the URL
- `500` — internal server error

**Caching:** Results are cached in-memory per URL for 5 minutes. The cache holds up to 100 entries (LRU-style eviction).

**User-Agent:** The fetcher sends a composite User-Agent string that includes `Twitterbot/1.0` and `facebookexternalhit/1.1` to convince servers to return OG-optimized responses (some sites serve different HTML to crawlers).

---

## Validation System

Located in `lib/validation.ts`. Every rule is a plain object with an `id`, `severity`, `check` function, and `fixSuggestion` string.

### The 17 Rules

| ID | Check | Severity | Points Deducted |
|---|---|---|---|
| `og:title` | og:title present | error | −10 |
| `og:description` | og:description present | warning | −5 |
| `og:image` | og:image present | error | −10 |
| `og:url` | og:url present | warning | −5 |
| `og:type` | og:type present | info | −2 |
| `og:site_name` | og:site_name present | info | −2 |
| `twitter:card` | twitter:card present | error | −10 |
| `twitter:title` | twitter:title or og:title present | warning | −5 |
| `twitter:image` | twitter:image or og:image present | warning | −5 |
| `meta:title` | `<title>` tag present | error | −10 |
| `meta:description` | meta description present | warning | −5 |
| `title:length` | title ≤ 60 chars | warning | −5 |
| `description:length` | description ≤ 160 chars | warning | −5 |
| `og:title:length` | og:title ≤ 60 chars | info | −2 |
| `og:description:length` | og:description ≤ 200 chars | info | −2 |
| `og:image:dimensions` | og:image:width + height declared | info | −2 |
| `og:image:alt` | og:image:alt present | info | −2 |

**Maximum deduction:** 70 points (all errors + warnings hit). Info issues only ever drop you from A/B to B/C.

### Score → Grade

```ts
score >= 90  →  A  (Excellent)
score >= 80  →  B  (Good)
score >= 70  →  C  (Average)
score >= 60  →  D  (Poor)
score  < 60  →  F  (Critical)
```

### Category Breakdown

The score header computes 6 sub-categories displayed as thin progress bars:

| Category | Issues included |
|---|---|
| Essential | meta:title, meta:description, og:title, og:description |
| Open Graph | og:title, og:description, og:image, og:url, og:type, og:site_name |
| Twitter / X | twitter:card, twitter:title, twitter:image |
| Images | og:image, og:image:dimensions, og:image:alt |
| Technical | meta:title, title:length, description:length, og:url |
| Extras | og:type, og:site_name |

---

## Fix Suggestions System

Located in `lib/suggestions.ts`. For every failing rule that has a template, `generateSuggestions()` returns a `Suggestion` object with three code variants:

- **HTML** — plain `<meta>` tags for any static site
- **Next.js** — `export const metadata = {}` syntax for App Router
- **Astro** — frontmatter-aware `<meta>` for `.astro` files

The Fix tab lets users switch between frameworks with a toggle and copy each snippet individually.

---

## State Management

`store/useAnalyzerStore.ts` — Zustand store with `persist` middleware.

**Persisted to `localStorage` (key: `metaxv-store`):**
- `history` — last 10 analyzed URLs with score, grade, title, timestamp
- `selectedPlatform` — remembered platform filter selection

**Not persisted (session only):**
- `result` — current analysis result
- `loading` — fetch in progress
- `error` — last error message

The history dropdown in `URLInput.tsx` reads from the store and lets users re-analyze any past URL with one click.

---

## Platform Previews

Each preview component receives the full `AnalysisResult` and renders a realistic mock of that platform's link card. They only use inline styles — no shared CSS — so they look correct regardless of the parent design system.

| Platform | Key metadata used | Key behavior |
|---|---|---|
| Google Search | `<title>`, meta description | Highlights truncation >60/155 chars |
| X / Twitter | twitter:card, twitter:image, og:* as fallback | Switches between `summary_large_image` and `summary` layouts |
| LinkedIn | og:title, og:image, og:description | Light-bg card section (actual LinkedIn style) |
| Discord | og:title, og:description, og:site_name, og:image | Blue left-border embed |
| Slack | og:title, og:description, og:site_name, og:image | Pink left-border unfurl |
| WhatsApp | og:title, og:description, og:image | Dark green bubble, link preview inside |
| Telegram | og:title, og:description, og:image | Dark blue bubble, left-border preview |
| Facebook | og:title, og:description, og:image | Post with action row |
| iMessage | og:title, og:description, og:image | Blue bubble, grey link card |

Fallback chain: most platforms use `twitter:*` → `og:*` → `meta:*` in that order, mirroring actual crawler behavior.

---

## ScoreRing Component

`components/analysis/ScoreRing.tsx` — Pure SVG + CSS animation. No canvas, no third-party chart library.

**How the ring works:**

```
circumference = 2π × radius
strokeDasharray = circumference        (full circle dashes)
strokeDashoffset = circumference × (1 - score/100)
                                       (how much to hide)
```

A linear gradient `<linearGradient>` defined in `<defs>` gives the arc its color per grade. The offset animates from `circumference` → final value via `requestAnimationFrame` with a cubic ease-out curve. The number counter runs a parallel animation on the same frame loop.

---

## Design System

All tokens live in `app/globals.css` as plain CSS custom properties on `:root`. No Tailwind variable resolution — everything is direct `var(--name)` references in inline styles or class definitions.

```css
--bg: #0b0b0c         /* page background */
--bg-card: #111114    /* card surfaces */
--bg-raised: #141417  /* hover states */
--border: #1f1f23     /* standard borders */
--border-subtle: #19191c

--text-primary: #e8e8ec
--text-secondary: #888892
--text-tertiary: #52525a
--text-muted: #36363d

--green: #4ade80      /* pass / A grade */
--yellow: #fbbf24     /* warning / C grade */
--red: #f87171        /* error / F grade */
--blue: #60a5fa       /* info */
```

Typography uses **Geist Sans** (body) and **Geist Mono** (code, labels, scores). Base size is 13px, `letter-spacing: -0.006em`.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

No database. No environment variables required. The only external call is the URL fetch inside the API route.

---

## Key Design Decisions

**Why server-side fetch instead of client-side?**
CORS. Browsers block cross-origin requests to most sites. The server has no such restriction and can also spoof the User-Agent to get crawler-optimized responses.

**Why Cheerio instead of a headless browser?**
Speed. Cheerio parses static HTML in ~5ms. Puppeteer/Playwright would take 3–10 seconds and adds enormous complexity. OG metadata always lives in `<head>` — it's available in the initial HTML response before any JavaScript runs.

**Why inline styles instead of Tailwind utility classes?**
Tailwind v4 resolves utility classes through CSS variables (`--spacing`, `--radius-xl`, etc.). In this build configuration those variables were not resolving correctly in the browser, causing broken layouts. Inline styles with direct `var(--token)` references bypass this entirely and are 100% reliable.

**Why Zustand instead of React Context or server state?**
The analysis result, loading state, and history need to be shared between the URL input (which triggers fetches) and the results panel (which reads them). Zustand gives a flat store with zero boilerplate. The `persist` middleware handles localStorage history with a single line.

**Why in-memory cache on the API route?**
Analyzing the same URL multiple times in a session (e.g., to check if a fix worked) would re-fetch unnecessarily. 5-minute TTL balances freshness against performance. The cache lives in the module scope — it resets on server restart, which is intentional (no stale data across deployments).

---

## Limitations

- **JavaScript-rendered metadata** — Cheerio parses raw HTML. If a site sets OG tags via client-side JavaScript after hydration, they won't be captured. Most well-implemented sites set OG tags in the initial HTML response.
- **Authentication-gated pages** — URLs that require login will return a login page HTML, not the actual content.
- **Rate limiting** — Some sites block bot User-Agents or rate-limit rapid requests. The API returns a descriptive error in these cases.
- **Image dimensions** — Reported only if `og:image:width` / `og:image:height` meta tags are present. The analyzer does not fetch the image to measure it.

---

## License

MIT

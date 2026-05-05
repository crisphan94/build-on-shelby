# Design System — DataShelf

> Generated with **UI UX Pro Max** reasoning engine.
> Product type: **AI Dataset Marketplace + Web3/Blockchain**
> Stack: **Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui**

---

## Table of Contents

1. [Design System Summary](#1-design-system-summary)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Patterns](#5-component-patterns)
6. [Effects & Animations](#6-effects--animations)
7. [Tailwind Configuration](#7-tailwind-configuration)
8. [UX Rules & Anti-Patterns](#8-ux-rules--anti-patterns)
9. [Pre-Delivery Checklist](#9-pre-delivery-checklist)

---

## 1. Design System Summary

```
+-----------------------------------------------------------------------------------------+
|  TARGET: DataShelf — AI Dataset Marketplace                                             |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  PRODUCT TYPE: AI/Chatbot Platform + Web3/Blockchain + Marketplace (P2P)               |
|                                                                                         |
|  PATTERN: Feature-Forward + Trust/Verifiability                                         |
|     Conversion: Data-driven credibility with technical depth                            |
|     Sections:                                                                           |
|       1. Top Navigation (search bar always visible)                                     |
|       2. Hero Banner (catalog page — above fold)                                        |
|       3. Filter Sidebar + Dataset Grid                                                  |
|       4. Dataset Detail (metadata + verify + download)                                  |
|       5. Upload Wizard (stepped form)                                                   |
|                                                                                         |
|  STYLE: AI-Native Dark UI                                                               |
|     Keywords: Technical precision, data-forward, trustworthy, developer-friendly        |
|     Best For: AI tools, data platforms, blockchain explorers, developer portals         |
|     Performance: Excellent | Accessibility: WCAG AA                                     |
|                                                                                         |
|  COLORS:                                                                                |
|     Primary:     #6366F1  (Indigo 500 — tech/AI identity)                              |
|     Secondary:   #14B8A6  (Teal 500 — data/trust/verification)                         |
|     Accent:      #F59E0B  (Amber 500 — CTA/earnings/value)                             |
|     Background:  #0F172A  (Slate 900 — main dark bg)                                   |
|     Surface:     #1E293B  (Slate 800 — card/panel bg)                                  |
|     Surface Alt: #334155  (Slate 700 — border/divider)                                 |
|     Text:        #F1F5F9  (Slate 100 — primary text)                                   |
|     Text Muted:  #94A3B8  (Slate 400 — secondary text)                                 |
|     Success:     #22C55E  (Green 500 — verified/success)                               |
|     Error:       #EF4444  (Red 500 — failed/error)                                     |
|     Warning:     #F97316  (Orange 500 — caution)                                       |
|                                                                                         |
|  TYPOGRAPHY:                                                                            |
|     Body: Inter (Google Fonts) — clean, readable, developer-trusted                    |
|     Code/Hash: JetBrains Mono — Merkle roots, addresses, IDs                           |
|     Google Fonts: https://fonts.google.com/share?selection.family=Inter:wght@           |
|                   400;500;600;700|JetBrains+Mono:wght@400;500                           |
|                                                                                         |
|  KEY EFFECTS:                                                                           |
|     Glassmorphism cards (backdrop-blur-md + bg-white/5)                                 |
|     Gradient left border on featured/primary cards                                      |
|     Subtle indigo glow on primary buttons (box-shadow)                                  |
|     Smooth transitions: 150-200ms ease-out                                              |
|     Number counter animations on stats                                                  |
|                                                                                         |
|  AVOID (Anti-patterns):                                                                 |
|     AI purple/pink gradients as primary colors                                          |
|     Rainbow/neon backgrounds                                                            |
|     Heavy bounce/spring animations that delay interaction                               |
|     White/light backgrounds for main content (breaks dark theme feel)                  |
|     Serif fonts for technical content                                                   |
|     Tiny click targets (< 44px touch target)                                            |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Color Palette

### Core Tokens

```css
/* globals.css — CSS custom properties */
:root {
  /* Brand */
  --color-primary:       #6366F1;  /* Indigo 500 */
  --color-primary-hover: #4F46E5;  /* Indigo 600 */
  --color-primary-muted: #6366F120; /* 12% opacity */

  --color-secondary:       #14B8A6; /* Teal 500 */
  --color-secondary-hover: #0D9488; /* Teal 600 */

  --color-accent:       #F59E0B;   /* Amber 500 */
  --color-accent-hover: #D97706;   /* Amber 600 */

  /* Backgrounds */
  --color-bg:           #0F172A;   /* Slate 900 */
  --color-surface:      #1E293B;   /* Slate 800 */
  --color-surface-alt:  #334155;   /* Slate 700 */

  /* Text */
  --color-text:         #F1F5F9;   /* Slate 100 */
  --color-text-muted:   #94A3B8;   /* Slate 400 */
  --color-text-subtle:  #64748B;   /* Slate 500 */

  /* Borders */
  --color-border:       #334155;   /* Slate 700 */
  --color-border-focus: #6366F1;   /* Primary */

  /* Semantic */
  --color-success:  #22C55E;  /* Green 500 */
  --color-error:    #EF4444;  /* Red 500 */
  --color-warning:  #F97316;  /* Orange 500 */
  --color-info:     #38BDF8;  /* Sky 400 */
}
```

### Usage Guide

| Token | Use Case | Example |
|---|---|---|
| `primary` | Primary buttons, links, active states, focus rings | Upload button, active nav item |
| `secondary` | Verified badge, success states, teal accents | "Verified ✓" label |
| `accent` | CTA emphasis, download count badge | "Download" button |
| `bg` | Page background | `<body>` background |
| `surface` | Cards, panels, modals | Dataset card background |
| `surface-alt` | Borders, dividers, subtle containers | `<hr>`, input border |
| `text-muted` | Secondary labels, metadata values | File size, upload date |
| `success` | Merkle verified state | ✓ icon + label |
| `error` | Merkle mismatch, upload failed | ✗ icon + label |

---

## 3. Typography

### Font Stack

```html
<!-- app/layout.tsx — Google Fonts import -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

```css
/* Tailwind font family extension */
font-family: Inter, ui-sans-serif, system-ui, sans-serif;        /* body */
font-family: 'JetBrains Mono', ui-monospace, monospace;          /* code/hash */
```

### Type Scale

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `text-4xl font-bold` | 36px | 700 | 1.1 | Page heroes (catalog H1) |
| `text-2xl font-semibold` | 24px | 600 | 1.25 | Section headings |
| `text-xl font-semibold` | 20px | 600 | 1.3 | Card titles, dataset name |
| `text-base font-medium` | 16px | 500 | 1.5 | Body copy, descriptions |
| `text-sm` | 14px | 400 | 1.5 | Metadata values, labels |
| `text-xs font-medium` | 12px | 500 | 1.4 | Badges, tags, timestamps |
| `font-mono text-sm` | 14px | 400 | 1.5 | Merkle roots, addresses, IDs |
| `font-mono text-xs` | 12px | 400 | 1.4 | Short hashes (truncated) |

---

## 4. Spacing & Layout

### Spacing Scale (Tailwind defaults)

```
4   = 1rem   = 16px  — Component internal padding
6   = 1.5rem = 24px  — Card padding
8   = 2rem   = 32px  — Section gap
12  = 3rem   = 48px  — Between major sections
16  = 4rem   = 64px  — Page top padding
```

### Layout Grid

```css
/* Container */
max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8

/* Catalog Grid */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6

/* Detail Page layout */
grid grid-cols-1 lg:grid-cols-3 gap-8
/* Left: lg:col-span-2 (metadata) | Right: lg:col-span-1 (actions) */

/* Sidebar + Content */
flex flex-col lg:flex-row gap-8
/* Sidebar: lg:w-64 | Content: flex-1 */
```

### Breakpoints

| Name | Width | Target |
|---|---|---|
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | iPad portrait |
| `lg` | 1024px | iPad landscape / small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1440px | Wide desktop |

---

## 5. Component Patterns

### 5.1 Dataset Card

```tsx
// Visual specification
<div className="
  group relative
  bg-slate-800 rounded-xl border border-slate-700
  p-6
  hover:border-indigo-500/50 hover:bg-slate-800/80
  transition-all duration-200
  cursor-pointer
">
  {/* Top row: MIME badge + size */}
  <div className="flex items-center justify-between mb-4">
    <MimeBadge type={mimeType} />
    <span className="text-xs text-slate-400 font-mono">{formatBytes(size)}</span>
  </div>

  {/* Name */}
  <h3 className="text-base font-semibold text-slate-100 line-clamp-2 mb-2">
    {name}
  </h3>

  {/* Description */}
  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
    {description}
  </p>

  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
    {tags.slice(0, 3).map(tag => <TagBadge key={tag} label={tag} />)}
    {tags.length > 3 && <span className="text-xs text-slate-500">+{tags.length - 3}</span>}
  </div>

  {/* Footer: downloads + date */}
  <div className="flex items-center justify-between text-xs text-slate-500">
    <span className="flex items-center gap-1">
      <DownloadIcon className="w-3.5 h-3.5" />
      {downloadCount.toLocaleString()}
    </span>
    <span>{formatRelativeDate(createdAt)}</span>
  </div>

  {/* Hover: gradient top border accent */}
  <div className="
    absolute inset-x-0 top-0 h-0.5 rounded-t-xl
    bg-gradient-to-r from-indigo-500 to-teal-500
    opacity-0 group-hover:opacity-100 transition-opacity duration-200
  " />
</div>
```

---

### 5.2 Primary Button

```tsx
// Primary — Upload / primary CTA
<button className="
  inline-flex items-center gap-2
  px-4 py-2.5 rounded-lg
  bg-indigo-600 hover:bg-indigo-500
  text-white text-sm font-semibold
  shadow-[0_0_16px_rgba(99,102,241,0.3)]
  hover:shadow-[0_0_24px_rgba(99,102,241,0.5)]
  transition-all duration-150
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  focus-visible:ring-offset-slate-900
  disabled:opacity-50 disabled:cursor-not-allowed
">
  {children}
</button>

// Secondary — neutral actions
<button className="
  inline-flex items-center gap-2
  px-4 py-2.5 rounded-lg
  bg-slate-700 hover:bg-slate-600
  border border-slate-600
  text-slate-200 text-sm font-medium
  transition-all duration-150
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-slate-500 focus-visible:ring-offset-2
  focus-visible:ring-offset-slate-900
">
  {children}
</button>

// Accent — Download CTA
<button className="
  inline-flex items-center gap-2
  px-4 py-2.5 rounded-lg
  bg-amber-500 hover:bg-amber-400
  text-slate-900 text-sm font-bold
  transition-all duration-150
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-amber-400 focus-visible:ring-offset-2
  focus-visible:ring-offset-slate-900
">
  {children}
</button>
```

---

### 5.3 MIME Type Badge

```tsx
const MIME_STYLES: Record<string, string> = {
  "text/csv":                   "bg-green-500/15 text-green-400 border-green-500/30",
  "application/json":           "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "application/zip":            "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "application/parquet":        "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "image/png":                  "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "text/plain":                 "bg-slate-500/15 text-slate-400 border-slate-500/30",
  // fallback
  default:                      "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

<span className={`
  inline-flex items-center
  px-2 py-0.5 rounded-md
  text-xs font-mono font-medium
  border
  ${MIME_STYLES[mimeType] ?? MIME_STYLES.default}
`}>
  {mimeType.split("/")[1].toUpperCase()}
</span>
```

---

### 5.4 Tag Badge

```tsx
<button
  onClick={() => onTagClick(label)}
  className="
    inline-flex items-center
    px-2.5 py-0.5 rounded-full
    bg-indigo-500/10 hover:bg-indigo-500/20
    border border-indigo-500/20 hover:border-indigo-500/40
    text-xs font-medium text-indigo-300
    transition-colors duration-150
    cursor-pointer
  "
>
  {label}
</button>
```

---

### 5.5 Verification Panel

```tsx
// Verified state
<div className="
  flex items-start gap-3 p-4 rounded-lg
  bg-green-500/10 border border-green-500/30
">
  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
  <div>
    <p className="text-sm font-semibold text-green-400">Integrity Verified</p>
    <p className="text-xs text-slate-400 mt-1">
      Merkle root matches on-chain commitment.
    </p>
    <div className="mt-3 space-y-1.5">
      <HashRow label="Stored" value={storedRoot} />
      <HashRow label="Actual" value={actualRoot} />
    </div>
    <p className="text-xs text-slate-500 mt-2">
      Verified {formatRelativeDate(verifiedAt)}
    </p>
  </div>
</div>

// Failed state
<div className="
  flex items-start gap-3 p-4 rounded-lg
  bg-red-500/10 border border-red-500/30
">
  <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
  <div>
    <p className="text-sm font-semibold text-red-400">Verification Failed</p>
    <p className="text-xs text-slate-400 mt-1">
      This dataset may have been tampered with.
    </p>
    ...
  </div>
</div>
```

---

### 5.6 Navbar

```
┌─────────────────────────────────────────────────────────────────┐
│  [DataShelf logo]    [──── Search datasets ────────────────]    │
│                                                                 │
│                                              [+ Upload Dataset] │
└─────────────────────────────────────────────────────────────────┘
```

```tsx
<nav className="
  sticky top-0 z-50
  border-b border-slate-800
  bg-slate-900/80 backdrop-blur-md
">
  <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between gap-4">
      <Logo />
      <SearchBar className="flex-1 max-w-xl" />
      <UploadButton />
    </div>
  </div>
</nav>
```

---

### 5.7 Empty State

```tsx
<div className="
  flex flex-col items-center justify-center
  py-24 px-6 text-center
">
  <div className="
    w-16 h-16 rounded-2xl mb-6
    bg-slate-800 border border-slate-700
    flex items-center justify-center
  ">
    <DatabaseIcon className="w-8 h-8 text-slate-500" />
  </div>
  <h3 className="text-lg font-semibold text-slate-200 mb-2">
    No datasets found
  </h3>
  <p className="text-sm text-slate-400 max-w-sm mb-6">
    Try adjusting your search or filters, or upload the first dataset.
  </p>
  <UploadButton />
</div>
```

---

### 5.8 Skeleton Loading

```tsx
// Dataset card skeleton
<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse">
  <div className="flex items-center justify-between mb-4">
    <div className="h-5 w-16 bg-slate-700 rounded-md" />
    <div className="h-4 w-12 bg-slate-700 rounded" />
  </div>
  <div className="h-5 w-3/4 bg-slate-700 rounded mb-2" />
  <div className="h-4 w-full bg-slate-700 rounded mb-1" />
  <div className="h-4 w-2/3 bg-slate-700 rounded mb-4" />
  <div className="flex gap-2 mb-4">
    <div className="h-5 w-14 bg-slate-700 rounded-full" />
    <div className="h-5 w-10 bg-slate-700 rounded-full" />
  </div>
  <div className="flex justify-between">
    <div className="h-3 w-16 bg-slate-700 rounded" />
    <div className="h-3 w-20 bg-slate-700 rounded" />
  </div>
</div>
```

---

## 6. Effects & Animations

### Transition Standards

```css
/* Fast — hover color changes, opacity toggles */
transition-all duration-150 ease-out

/* Standard — card hover, panel open */
transition-all duration-200 ease-out

/* Slow — modal backdrop, page transitions */
transition-all duration-300 ease-out
```

### Glassmorphism Panel

```tsx
<div className="
  bg-white/5 backdrop-blur-md
  border border-white/10 rounded-xl
  shadow-xl shadow-black/20
">
```

### Glow Effects

```css
/* Primary button glow */
box-shadow: 0 0 16px rgba(99, 102, 241, 0.30);

/* Primary button hover glow */
box-shadow: 0 0 24px rgba(99, 102, 241, 0.50);

/* Success (verified) glow */
box-shadow: 0 0 12px rgba(34, 197, 94, 0.25);
```

### Gradient Accent Border (Card Top)

```css
background: linear-gradient(90deg, #6366F1, #14B8A6);
height: 2px;
opacity: 0; /* visible on hover */
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          hover:   "#4F46E5",
          muted:   "rgba(99,102,241,0.12)",
        },
        secondary: {
          DEFAULT: "#14B8A6",
          hover:   "#0D9488",
        },
        accent: {
          DEFAULT: "#F59E0B",
          hover:   "#D97706",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-primary": "0 0 16px rgba(99,102,241,0.30)",
        "glow-primary-lg": "0 0 24px rgba(99,102,241,0.50)",
        "glow-success": "0 0 12px rgba(34,197,94,0.25)",
        "glow-error":   "0 0 12px rgba(239,68,68,0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 8. UX Rules & Anti-Patterns

### Rules to Follow

1. **All clickable elements must have `cursor-pointer`** — no exceptions.
2. **Minimum touch target: 44×44px** — especially on mobile for buttons and tag filters.
3. **Never use color alone** to indicate state — always pair with an icon or label (e.g., ✓ + green text, not just green).
4. **Truncate long text gracefully** — use `line-clamp-2` for descriptions, `truncate` for single-line items like addresses.
5. **Skeleton before content** — show skeleton cards immediately; never an empty grid flash.
6. **Error messages must be actionable** — "Retry", "Try different file", not just "Error occurred".
7. **Hash values always in `font-mono`** — Merkle roots, Aptos addresses, blob URLs.
8. **Focus rings always visible** — `focus-visible:ring-2 focus-visible:ring-indigo-500`.
9. **`aria-label` on icon-only buttons** — e.g., copy button: `aria-label="Copy Merkle root"`.
10. **Smooth search debounce 300ms** — never fire on every keystroke.

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoid | Alternative |
|---|---|---|
| AI purple/pink gradient backgrounds | Cliché for AI; breaks data-trust aesthetic | Use solid `slate-900` bg + indigo accents only |
| Serif fonts for technical content | Hard to scan; breaks developer credibility | Inter (sans) + JetBrains Mono |
| Heavy spring/bounce animations | Delays interactions; distracting | `ease-out` 150-200ms transitions only |
| Showing raw blob URLs to users | Confusing; not human-readable | Show truncated hash + copy button |
| Pagination with "Load More" only | Breaks shareability | URL-based pagination (`?page=3`) |
| Disabling buttons without explanation | Confusing | Disabled + tooltip explaining why |
| Full-page loading spinners | Jarring UX | Skeleton cards per content block |
| Light mode for main content | Breaks design language | Dark-first; no light mode in MVP |

---

## 9. Pre-Delivery Checklist

Before shipping any page or component, verify:

```
LAYOUT
  [ ] No emojis as icons — use SVG (Heroicons or Lucide)
  [ ] cursor-pointer on all clickable elements
  [ ] Hover states with smooth transitions (150-200ms)
  [ ] Responsive: 375px, 768px, 1024px, 1440px tested

ACCESSIBILITY
  [ ] Light text on dark: contrast ratio ≥ 4.5:1
  [ ] Focus rings visible on all interactive elements
  [ ] aria-label on all icon-only buttons
  [ ] No keyboard traps
  [ ] prefers-reduced-motion respected

TYPOGRAPHY
  [ ] All hash/address values use font-mono
  [ ] Text never overflows container (truncate or line-clamp applied)
  [ ] No raw IDs shown to users (mask or truncate to first/last 6 chars)

DATA STATES
  [ ] Loading skeleton shown while fetching
  [ ] Empty state shown when list is empty
  [ ] Error state shown on API failure with retry action

SECURITY
  [ ] No sensitive data (private key, raw connection strings) in client bundle
  [ ] User input sanitized before rendering (no dangerouslySetInnerHTML)
  [ ] File upload validates type + size server-side

PERFORMANCE
  [ ] Images have explicit width/height to prevent layout shift
  [ ] No heavy libraries imported client-side unnecessarily
  [ ] Font display: swap on Google Fonts
```

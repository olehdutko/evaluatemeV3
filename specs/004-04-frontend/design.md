# EvaluateMe.IT v3 — Frontend Design System

**Document**: `specs/004-04-frontend/design.md`  
**Status**: Draft  
**Created**: 2026-08-11

## 1. Design Philosophy

EvaluateMe.IT is a platform about *precision under pressure*: programmers prove their skills through focused, timed tests. The UI should feel like a contemporary **diagnostic instrument** — calm, confident, and slightly technical — rather than a generic SaaS dashboard.

We commit to a direction called **"warm brutalism"**:

- **Brutalist structure**: visible grid lines, strong typographic hierarchy, rectangular forms, generous whitespace.
- **Warm execution**: earthy secondary palette, soft paper-like background, amber/terracotta accents instead of cold blue.
- **Editorial detail**: big headings, thin rules, numbered sections, and a monospace accent font for data and code-adjacent labels.

This avoids the overused "purple-blue gradient on white" AI-startup aesthetic while staying professional enough for companies evaluating candidates.

## 2. Visual Identity

### Color Palette

CSS variables (defined in `apps/web/src/app/globals.css`):

```css
:root {
  --bg-primary: #faf8f5;       /* warm off-white, paper */
  --bg-secondary: #f2efe9;      /* subtle panel background */
  --bg-tertiary: #e8e4dc;       /* inputs, cards hover */
  --text-primary: #1a1816;      /* near-black ink */
  --text-secondary: #6b6560;     /* warm gray */
  --text-muted: #9a9590;         /* placeholders, meta */
  --accent: #c15c34;             /* terracotta / burnt sienna */
  --accent-hover: #a34b2a;       /* deeper terracotta */
  --accent-soft: #f4e6df;        /* tinted backgrounds */
  --success: #3a7d5c;            /* forest green */
  --error: #b94a48;              /* muted red */
  --warning: #c48a2c;            /* mustard */
  --info: #4a6fa5;               /* dusty blue */
  --border: #d8d4cc;             /* warm rule color */
  --border-strong: #1a1816;      /* black rules for emphasis */
}
```

### Typography

Use **Next.js font optimization** (`next/font/google`) with a distinctive pairing:

- **Headings / display**: `Space Grotesk` is forbidden. Use **"Syne"** or **"Clash Display"** via Google Fonts. We choose **Syne** (geometric, slightly oddball, memorable) for H1–H3 and brand marks.
- **Body**: **"Source Serif 4"** — a warm, highly legible serif that gives the UI an editorial/magazine feel without being old-fashioned.
- **Mono / data**: **"JetBrains Mono"** for code snippets, test IDs, timestamps, and technical metadata.

```tsx
import { Syne, Source_Serif_4, JetBrains_Mono } from 'next/font/google';

export const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['500', '700'] });
export const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-body' });
export const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

### Spacing & Layout

- Base unit: `4px`.
- Container max-width: `1280px` (`max-w-7xl` equivalent).
- Page sections separated by `1px` warm border rules rather than heavy shadows.
- Cards: no rounded corners (or `2px` radius maximum). Sharp, architectural edges.
- Shadow usage: minimal — only a thin `0 1px 0 rgba(0,0,0,0.06)` bottom rule on cards.

## 3. Component Styles

### Button

Primary button:

- Background `var(--accent)`.
- Text white.
- Padding `12px 24px`.
- Border-radius `0`.
- Uppercase label, letter-spacing `0.04em`, font-weight 600.
- Hover: background `var(--accent-hover)`, translate Y `-1px`.
- Active: translate Y `0`.

Secondary button:

- Transparent background.
- `1px` solid `var(--border-strong)` text color.
- Hover: background `var(--bg-secondary)`.

### Cards

- Background `var(--bg-primary)`.
- `1px` border `var(--border)`.
- No shadow.
- Hover: border color transitions to `var(--border-strong)`.
- Optional top accent bar (`4px` height, `var(--accent)`).

### Forms / Inputs

- Background `var(--bg-secondary)`.
- Border `1px solid var(--border)`.
- Border-radius `0`.
- Focus ring: `2px` inset offset accent color.
- Label: uppercase mono, `var(--text-secondary)`, letter-spacing `0.06em`, font-size `12px`.

### Status Indicators

Replace generic colored dots with **small rectangular badges** with a thin left border:

- `ok` / `healthy` → left border `var(--success)`, text `var(--success)`.
- `error` / `unhealthy` → left border `var(--error)`, text `var(--error)`.
- `warning` → left border `var(--warning)`.
- `info` / `pending` → left border `var(--info)`.

### Navigation

- Header: `var(--bg-primary)` with a single `1px` bottom rule.
- Logo: Syne bold, with a small monospace superscript label "v3" in `var(--accent)`.
- Nav links: serif body, hover underline offset `4px`.
- Mobile menu: full-screen overlay with large display type links and a visible rule list.

## 4. Page-Specific Notes

### Home (`/`)

Treat as a **magazine cover**:

- Massive headline "Prove what you know" or similar, left-aligned.
- A thin horizontal rule separates the hero from a grid of feature links.
- No generic hero gradients. Use large type, negative space, and a single oversized technical illustration or abstract grid pattern.

### Technologies Catalog (`/technologies`)

- List as **numbered index** (01 TypeScript, 02 Python, etc.).
- Each row: name, slug in mono, short description, and a "Start" action aligned to the right.
- Hover: entire row background shifts to `var(--bg-secondary)` and a vertical accent bar appears.

### Test Session (`/tests/:sessionId`)

- Full-width focused layout, dimmed surrounding UI.
- Progress indicator as a segmented horizontal bar, not a circular spinner.
- Question card with a visible border and a "Q." prefix.
- Answer options as large rectangular selectable tiles.
- Submit button always visible but disabled until an option is chosen.

### Login / Register

- Split layout: left side — large display quote / product statement; right side — minimal form inside a bordered panel.
- Form panel has a thin top accent bar.
- No floating labels. Uppercase mono labels above inputs.

## 5. Motion & Interaction

- **Page load**: content fades up `12px` with `opacity 0 → 1`, staggered by `0.05s` per major block.
- **Button hover**: `transform: translateY(-1px)` and color transition `150ms`.
- **Card hover**: border-color transition `200ms`.
- **Test progress**: segments fill with a quick scale transform from left.
- Prefer CSS transitions/keyframes. Use `framer-motion` only where orchestrated sequences are needed.

## 6. Accessibility

- Color contrast meets WCAG AA for all text.
- Focus indicators are visible and use the accent color.
- All interactive elements have `aria-label` where label is not textual.
- Reduced motion: disable transforms and fades when `prefers-reduced-motion: reduce`.

## 7. Technical Notes

- Tailwind CSS MUST be installed and configured in `apps/web` before design implementation.
- Tailwind config extends the palette via CSS variables so both Tailwind utilities and custom components share the same tokens.
- Fonts loaded via `next/font/google` to avoid layout shift.
- No external CSS frameworks (Bootstrap, Material UI, Chakra, etc.).

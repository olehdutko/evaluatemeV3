# Frontend Roadmap for EvaluateMe.IT v3

**Document**: `specs/004-04-frontend/roadmap.md`  
**Status**: Draft  
**Created**: 2026-08-11  
**Scope**: All frontend pages and components required to expose the existing and planned backend capabilities.

## 1. Current State

The frontend foundation (`004-04-frontend`) is implemented as a thin skeleton:

- Root layout, header, footer.
- Typed API client with Zod schemas.
- Reusable UI components (`PageHeader`, `Loading`, `ErrorMessage`, `StatusBadge`).
- Minimal public pages: `/`, `/technologies`, `/health`, `/login`, `/register`, `/technologies/:slug/start`, `/tests/:sessionId`.

Tailwind CSS is **not yet installed** in `apps/web`, so Tailwind classes in existing components produce no styles. The immediate priority is to install Tailwind, wire the design system, and rebuild the existing pages under the new visual direction.

## 2. Guiding Principles

- Each backend user-facing feature gets a concrete frontend slice.
- Server-first pages where possible; client components only for interactivity.
- Every new page MUST have a contract/unit test and a visual smoke test.
- The design system from `design.md` (warm brutalism / editorial instrument) applies to all new work.

## 3. Phase A — Design System & Foundation Refresh

**Goal**: Make Tailwind work and rebuild the foundation pages so they look intentional.

| ID | Task | Priority | Depends on |
|----|------|----------|------------|
| A01 | Install `tailwindcss`, `postcss`, `autoprefixer` in `apps/web` and create `tailwind.config.ts` / `postcss.config.js` | P1 | — |
| A02 | Create `apps/web/src/app/globals.css` with CSS variables from `design.md` and font variables | P1 | A01 |
| A03 | Load Syne, Source Serif 4, JetBrains Mono via `next/font/google` in layout | P1 | A02 |
| A04 | Implement design tokens as Tailwind theme extensions (colors, fonts, spacing, border-radius) | P1 | A01 |
| A05 | Rebuild `Header` with mobile menu, logo treatment, and nav rules | P1 | A03, A04 |
| A06 | Rebuild `Footer` to match design system | P1 | A03, A04 |
| A07 | Rebuild `PageHeader`, `Loading`, `ErrorMessage`, `StatusBadge` with new styles | P1 | A04 |
| A08 | Rebuild `/` home page as editorial magazine-cover landing | P1 | A05–A07 |
| A09 | Rebuild `/technologies` as numbered index list | P1 | A07 |
| A10 | Rebuild `/health` with status badges and layout grid | P2 | A07 |
| A11 | Add visual integration/smoke tests for foundation pages | P1 | A08–A10 |

## 4. Phase B — Authentication & Account Pages

**Goal**: Expose the already-implemented `005-05-auth` API through a polished UI.

| ID | Task | Priority | Backend Feature |
|----|------|----------|-----------------|
| B01 | Rebuild `/login` with split layout and form validation UX | P1 | 005-05-auth |
| B02 | Rebuild `/register` with role selection and clear value proposition per role | P1 | 005-05-auth |
| B03 | Create `/profile` page: view/update email, change password | P2 | 005-05-auth |
| B04 | Add logout button and user menu in `Header` when authenticated | P1 | 005-05-auth |
| B05 | Create `/forgot-password` request page (backend endpoint may be future) | P3 | 005-05-auth |
| B06 | Add auth-aware middleware redirect rules and loading states | P1 | 005-05-auth |
| B07 | Add unit/integration tests for login, register, and logout flows | P1 | B01–B04 |

## 5. Phase C — Test Engine Experience

**Goal**: Turn the raw test-engine API into a confident, focused test-taking interface.

| ID | Task | Priority | Backend Feature |
|----|------|----------|-----------------|
| C01 | Rebuild `/technologies/:slug/start` as pre-test briefing page (rules, duration, start CTA) | P1 | 008-08-test-engine |
| C02 | Rebuild `/tests/:sessionId` question UI with segmented progress, large answer tiles, timer | P1 | 008-08-test-engine |
| C03 | Create `/tests/:sessionId/results` page showing score, breakdown, and review | P1 | 008-08-test-engine |
| C04 | Create `/tests/:sessionId/review` page to revisit each question and correct answer | P2 | 008-08-test-engine |
| C05 | Add `/history` page listing user's past sessions and scores | P2 | 008-08-test-engine, 009-09-testing |
| C06 | Add full-screen focus mode and tab-leave warning for active tests | P2 | C02 |
| C07 | Add tests for test start, answer submission, and result rendering | P1 | C01–C03 |

## 6. Phase D — Company & Candidate Flow

**Goal**: Implement the lightweight session-token flow for companies and candidates.

| ID | Task | Priority | Backend Feature |
|----|------|----------|-----------------|
| D01 | Create `/access` page where a candidate enters an access code | P1 | 008-08-test-engine |
| D02 | Create `/sessions/:token` candidate test page (session-based, no account) | P1 | 008-08-test-engine |
| D03 | Create company `/dashboard` page with access code usage and results | P2 | 005-05-auth, 008-08-test-engine |
| D04 | Create `/company/orders` page for purchasing access codes/credits | P2 | 007-07-payments |
| D05 | Add tests for access-code entry and candidate test flow | P1 | D01–D02 |

## 7. Phase E — Admin & Content Management

**Goal**: Give admins a management interface for the platform.

| ID | Task | Priority | Backend Feature |
|----|------|----------|-----------------|
| E01 | Create `/admin/tests` list and CRUD for tests | P2 | 009-09-testing |
| E02 | Create `/admin/questions` question editor with answers and scoring | P2 | 009-09-testing |
| E03 | Create `/admin/technologies` technology CRUD | P2 | 001-01-architecture |
| E04 | Create `/admin/users` user management and activation | P2 | 005-05-auth |
| E05 | Create `/admin/credit-settings` price/configuration editor | P2 | 001-01-architecture |
| E06 | Create `/admin/email-templates` and `/admin/landing-ads` editors | P3 | 009-09-testing |
| E07 | Add RBAC-aware route guards and admin menu | P2 | 006-06-security |
| E08 | Add admin page tests | P2 | E01–E07 |

## 8. Phase F — Polish & Performance

| ID | Task | Priority | Notes |
|----|------|----------|-------|
| F01 | Implement loading skeletons for all data pages | P2 | — |
| F02 | Add error boundaries and not-found pages | P2 | — |
| F03 | Add SEO metadata and OpenGraph tags per page | P2 | — |
| F04 | Implement client-side caching/SWR wrapper over API client | P3 | — |
| F05 | Run Lighthouse audit and address accessibility/performance issues | P2 | — |
| F06 | Add Storybook or visual regression snapshots | P3 | — |

## 9. Execution Recommendation

The next concrete sprint should cover **Phase A** completely and **Phase B/C** partially:

1. Install Tailwind and the design system.
2. Rebuild foundation pages (`/`, `/technologies`, `/health`).
3. Rebuild auth pages (`/login`, `/register`) and add user menu in header.
4. Rebuild test experience (`/technologies/:slug/start`, `/tests/:sessionId`, `/tests/:sessionId/results`).

This gives the product a coherent public face and a usable end-to-end test flow before adding company/admin complexity.

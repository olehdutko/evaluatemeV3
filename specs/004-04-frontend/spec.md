# Feature Specification: Frontend Foundation

**Feature Branch**: `004-04-frontend`

**Created**: 2026-08-10

**Updated**: 2026-08-11

**Status**: Draft

**Input**: User description: "Build the Next.js App Router frontend foundation: shared layout, navigation, typed API client, reusable components, and minimal pages for health and technology catalog. Then extend it into a real product surface with authentication, test taking, and a distinctive visual design."

## User Scenarios & Testing

### User Story 1 — P1: Shared Layout and Navigation

As a visitor, I need a consistent layout with navigation so that I can move between public pages (home, technologies, health, login, register).

**Why this priority**: The shared layout is the base for every page; without it, each page reinvents chrome and navigation.

**Independent Test**: Render the layout in a unit test and confirm navigation links exist and point to known routes.

**Acceptance Scenarios**:

1. **Given** any page, **When** it loads, **Then** it renders a header with links to `/`, `/technologies`, `/health`, and auth actions (`/login`, `/register` or user menu when authenticated).
2. **Given** a mobile viewport, **When** the menu is toggled, **Then** navigation links are accessible.
3. **Given** an authenticated user, **When** they open the header, **Then** they see their email/identifier and a logout option instead of login/register links.

### User Story 2 — P1: Design System and Tailwind Configuration

As a frontend developer, I need a working Tailwind setup with a unique design system so that all pages share a cohesive, non-generic visual language.

**Why this priority**: Currently Tailwind is not installed, so existing Tailwind classes produce no styles. The product cannot ship without a functioning CSS framework and a clear visual direction.

**Independent Test**: `npm run build` in `apps/web` succeeds and produced HTML includes the compiled styles. A visual smoke test confirms the design tokens (colors, fonts, spacing) are applied.

**Acceptance Scenarios**:

1. **Given** the design tokens in `apps/web/src/app/globals.css`, **When** a component uses Tailwind utilities mapped to those tokens, **Then** the rendered output matches the documented palette and typography.
2. **Given** the loaded fonts (Syne, Source Serif 4, JetBrains Mono), **When** the page renders, **Then** no layout shift from font swapping is visible and headings/body/mono text use the correct font family.

### User Story 3 — P2: Typed API Client and Data Fetching

As a frontend developer, I need a typed REST client that validates API responses with Zod so that backend contract changes are caught at build time.

**Why this priority**: Typed data fetching prevents runtime surprises and aligns the frontend with the API conventions.

**Independent Test**: Unit tests mock API responses and assert the client validates success/error envelopes.

**Acceptance Scenarios**:

1. **Given** a valid `GET /api/v1/health` response, **When** fetched, **Then** the client returns typed data.
2. **Given** an invalid response envelope, **When** fetched, **Then** the client throws a typed error.

### User Story 4 — P2: Reusable Page Components

As a frontend developer, I need reusable components (`PageHeader`, `Loading`, `ErrorMessage`, `StatusBadge`) so that pages are consistent and easy to maintain.

**Why this priority**: Reusable components reduce duplication and make the UI predictable.

**Independent Test**: Component unit tests render each reusable component with representative props.

**Acceptance Scenarios**:

1. **Given** a `PageHeader` with title and description, **When** rendered, **Then** both texts appear and follow the display/body font hierarchy.
2. **Given** an `ErrorMessage`, **When** rendered, **Then** it displays the message with a retry action if provided and uses the error color token.

### User Story 5 — P1: Public Pages

As a visitor, I need home, technology catalog, and system health pages so that I can understand the product and browse available tests.

**Why this priority**: These are the first surfaces a user sees; they must look intentional and work end-to-end.

**Independent Test**: Visual integration tests render each page and assert key elements are present.

**Acceptance Scenarios**:

1. **Given** `/`, **When** it loads, **Then** it shows a headline, subhead, and links to `/technologies` and `/health` in the editorial magazine-cover layout.
2. **Given** `/technologies`, **When** it loads, **Then** it lists technologies as a numbered index with name, slug, description, and a start action.
3. **Given** `/health`, **When** it loads successfully, **Then** it shows API and database status using `StatusBadge` components.

### User Story 6 — P1: Authentication Pages

As a visitor, I need to register and log in through a polished UI so that I can access personalized features.

**Why this priority**: Auth is the gateway to test history, profile, company dashboard, and admin tools.

**Independent Test**: Integration tests submit the login and register forms with mocked or real API responses and assert correct redirects and error states.

**Acceptance Scenarios**:

1. **Given** `/login`, **When** valid credentials are submitted, **Then** the user is authenticated and redirected to `/technologies`.
2. **Given** `/register`, **When** a new account is created, **Then** the user is logged in automatically and redirected to `/technologies`.
3. **Given** an auth error, **When** the form receives it, **Then** a clear error message is shown without losing form input.

### User Story 7 — P1: Test Start and Test Session Pages

As an authenticated user or candidate, I need to start a test and answer questions through a focused UI so that I can complete an evaluation.

**Why this priority**: This is the core value proposition of the platform.

**Independent Test**: End-to-end integration test starts a test from a technology, submits answers, and lands on a results page.

**Acceptance Scenarios**:

1. **Given** `/technologies/:slug/start`, **When** the user confirms, **Then** a test session is created and the user is redirected to `/tests/:sessionId`.
2. **Given** `/tests/:sessionId`, **When** a question is displayed, **Then** it shows progress, question content, large answer tiles, and a disabled submit button until an answer is selected.
3. **Given** the last question, **When** it is answered, **Then** the user is redirected to `/tests/:sessionId/results` showing the score and summary.

## Requirements

### Functional Requirements

- **FR-001**: A shared root layout MUST exist in `apps/web/src/app/layout.tsx` and wrap all pages with a header and footer.
- **FR-002**: The header MUST contain navigation links to `/`, `/technologies`, `/health`, and auth actions (`/login`, `/register` or authenticated user menu).
- **FR-003**: Tailwind CSS MUST be installed and configured in `apps/web` with a custom theme extending the design tokens from `design.md`.
- **FR-004**: The typed API client in `apps/web/src/lib/api-client.ts` MUST parse JSON and validate responses with Zod.
- **FR-005**: The API client MUST throw a typed `ApiError` for non-2xx responses and invalid envelopes.
- **FR-006**: Reusable components (`PageHeader`, `Loading`, `ErrorMessage`, `StatusBadge`, `Button`, `Card`) MUST live in `apps/web/src/components/` and follow the design system.
- **FR-007**: Public pages (`/`, `/technologies`, `/health`) MUST consume the API client and handle loading/error states.
- **FR-008**: Authentication pages (`/login`, `/register`) MUST integrate with the `AuthProvider` and backend auth API.
- **FR-009**: Test pages (`/technologies/:slug/start`, `/tests/:sessionId`, `/tests/:sessionId/results`) MUST consume the test-engine API.
- **FR-010**: The frontend MUST use the warm-brutalist design system from `specs/004-04-frontend/design.md` (no stock Bootstrap/Material/Chakra styles).
- **FR-011**: Fonts MUST be loaded via `next/font/google` to avoid layout shift.
- **FR-012**: All pages MUST include appropriate metadata (title, description) and be mobile responsive.

### Key Components

- **RootLayout**: HTML lang, metadata, font variables, header, main, footer.
- **Header**: logo with "v3" mono label, navigation links, mobile menu, authenticated user menu.
- **Footer**: copyright, architecture docs link, minimal mono footer line.
- **ApiClient**: fetch wrapper with Zod validation and error mapping.
- **Button**: primary and secondary variants with uppercase labels and hover lift.
- **Card**: sharp-edged bordered panel with optional top accent bar.
- **PageHeader**: title + optional description using display/body font hierarchy.
- **Loading**: skeleton or text state consistent with design tokens.
- **ErrorMessage**: message + optional retry callback.
- **StatusBadge**: rectangular badge with left border color for ok/error/pending states.
- **ProgressSegments**: segmented progress bar for test sessions.
- **AnswerTile**: large selectable tile for test answer options.

## Success Criteria

- **SC-001**: `npm run test` in `apps/web` passes with component and client unit tests.
- **SC-002**: `npm run build` generates all pages without errors and includes compiled Tailwind styles.
- **SC-003**: All public pages render in a smoke test (production build export).
- **SC-004**: No `any` or untyped fetch usage in `apps/web/src`.
- **SC-005**: The UI visually matches the warm-brutalist design system on desktop and mobile.
- **SC-006**: Login and register flows redirect authenticated users to `/technologies` and show errors gracefully.
- **SC-007**: A complete test flow (start → answer questions → results) is covered by at least one integration test.

## Architecture & Non-Functional Constraints

- Frontend code MUST NOT import backend-only packages (`@nestjs/*`, `@prisma/client`).
- Components SHOULD be server-first (React Server Components) where possible.
- Client components MUST be explicit (e.g., `\'use client\'` directive).
- External input MUST be validated via Zod at the API boundary.
- No Docker or container-dependent workflows.
- Tailwind CSS MUST be the sole styling framework; no Bootstrap, Material UI, Chakra UI, or similar.
- Reduced-motion preferences MUST be respected.

## Design References

- `specs/004-04-frontend/design.md` — full design system.
- `specs/004-04-frontend/roadmap.md` — phased frontend roadmap.

## Assumptions

- The Next.js app uses the App Router (`app/` directory).
- Tailwind CSS will be installed as part of this feature update.
- Backend endpoints from `001-01-architecture`, `003-03-api`, `005-05-auth`, and `008-08-test-engine` are available.
- The design direction is "warm brutalism" with editorial typography and sharp, architectural components.

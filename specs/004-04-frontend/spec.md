# Feature Specification: Frontend Foundation

**Feature Branch**: `004-04-frontend`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Build the Next.js App Router frontend foundation: shared layout, navigation, typed API client, reusable components, and minimal pages for health and technology catalog."

## User Scenarios & Testing

### User Story 1 — P1: Shared Layout and Navigation

As a visitor, I need a consistent layout with navigation so that I can move between public pages (home, technologies, health).

**Why this priority**: The shared layout is the base for every page; without it, each page reinvents chrome and navigation.

**Independent Test**: Render the layout in a unit test and confirm navigation links exist and point to known routes.

**Acceptance Scenarios**:

1. **Given** any page, **When** it loads, **Then** it renders a header with links to `/`, `/technologies`, `/health`.
2. **Given** a mobile viewport, **When** the menu is toggled, **Then** navigation links are accessible.

### User Story 2 — P2: Typed API Client and Data Fetching

As a frontend developer, I need a typed REST client that validates API responses with Zod so that backend contract changes are caught at build time.

**Why this priority**: Typed data fetching prevents runtime surprises and aligns the frontend with the API conventions.

**Independent Test**: Unit tests mock API responses and assert the client validates success/error envelopes.

**Acceptance Scenarios**:

1. **Given** a valid `GET /api/v1/health` response, **When** fetched, **Then** the client returns typed data.
2. **Given** an invalid response envelope, **When** fetched, **Then** the client throws a typed error.

### User Story 3 — P3: Reusable Page Components

As a frontend developer, I need reusable components (`PageHeader`, `Loading`, `ErrorMessage`, `StatusBadge`) so that pages are consistent and easy to maintain.

**Why this priority**: Reusable components reduce duplication and make the UI predictable.

**Independent Test**: Component unit tests render each reusable component with representative props.

**Acceptance Scenarios**:

1. **Given** a `PageHeader` with title and description, **When** rendered, **Then** both texts appear.
2. **Given** an `ErrorMessage`, **When** rendered, **Then** it displays the message and a retry action if provided.

## Requirements

### Functional Requirements

- **FR-001**: A shared root layout MUST exist in `apps/web/src/app/layout.tsx` and wrap all pages with a header and footer.
- **FR-002**: The header MUST contain navigation links to `/`, `/technologies`, `/health`.
- **FR-003**: The typed API client in `apps/web/src/lib/api-client.ts` MUST parse JSON and validate responses with Zod.
- **FR-004**: The API client MUST throw a typed `ApiError` for non-2xx responses and invalid envelopes.
- **FR-005**: Reusable components (`PageHeader`, `Loading`, `ErrorMessage`, `StatusBadge`) MUST live in `apps/web/src/components/`.
- **FR-006**: Public pages (`/`, `/technologies`, `/health`) MUST consume the API client and handle loading/error states.
- **FR-007**: The frontend MUST use Tailwind CSS or an equivalent utility-first approach already configured in the project.

### Key Components

- **RootLayout**: HTML lang, metadata, header, main, footer.
- **Header**: logo, navigation links, mobile menu toggle.
- **Footer**: copyright / link to docs.
- **ApiClient**: fetch wrapper with Zod validation and error mapping.
- **PageHeader**: title + optional description.
- **Loading**: spinner / skeleton.
- **ErrorMessage**: message + optional retry callback.
- **StatusBadge**: colored badge for ok/error/pending states.

## Success Criteria

- **SC-001**: `npm run test` in `apps/web` passes with component and client unit tests.
- **SC-002**: `npm run build` generates all pages without errors.
- **SC-003**: All public pages render in a smoke test (production build export).
- **SC-004**: No `any` or untyped fetch usage in `apps/web/src`.

## Architecture & Non-Functional Constraints

- Frontend code MUST NOT import backend-only packages (`@nestjs/*`, `@prisma/client`).
- Components SHOULD be server-first (React Server Components) where possible.
- Client components MUST be explicit (e.g., `\'use client\'` directive).
- External input MUST be validated via Zod at the API boundary.
- No Docker or container-dependent workflows.

## Assumptions

- The Next.js app uses the App Router (`app/` directory).
- Tailwind CSS is already configured (or will be added as part of this feature).
- Backend endpoints from `001-01-architecture` and `003-03-api` are available.

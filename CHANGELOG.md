# Development Log

## 2026-08-10 — Feature 005-05-auth

- Implemented backend JWT authentication: register, login, refresh, logout.
- Added token blacklist via `InMemoryTokenBlacklist`.
- Added session-token adapter for company/candidate flows.
- Wired `AuthController` and `AuthModule` into `AppModule`.
- Implemented frontend `/login`, `/register` pages with forms and `AuthProvider` context.
- Added Next.js middleware route guard redirecting unauthenticated users.
- Added unit tests for backend (48 passed) and frontend (22 passed).
- Auth integration tests skip when `DATABASE_URL` is unavailable.
- Committed as `9993af7 feat: 005-05-auth JWT auth, session tokens, login/register UI, route guard`.


## Dev servers — 2026-08-10

- Started local MySQL via Homebrew (`/opt/homebrew/opt/mysql/bin/mysqld_safe`).
- Created `evaluateme_db` and local user `evaluateme/evaluateme`.
- Started API dev server on `http://localhost:40001` (pid `$(cat /tmp/api-dev.pid)`).
- Started web dev server on `http://localhost:4000` (pid `$(cat /tmp/web-dev.pid)`).
- Smoke tests passed:
  - `POST /api/v1/auth/register` — user created.
  - `POST /api/v1/auth/login` — JWT access + refresh tokens issued.
  - `POST /api/v1/auth/refresh` — new access token issued.
  - `POST /api/v1/auth/logout` — refresh token blacklisted, subsequent refresh returns 401.
  - `GET /login` — 200.
  - `GET /technologies` without auth — 307 redirect to `/login` (middleware guard).

## Note — 2026-08-10

Migration deploy against remote `evaluateme_db` failed because the database already contains legacy data and migrations require non-null columns on existing rows.
To avoid data loss, we did **not** use `--force-reset`. The API starts and `/api/v1/health` responds, but health shows `database: error` because Prisma expects a schema state that doesn't match.
Options going forward:
1. Backup and truncate legacy tables, then re-run `prisma migrate deploy`.
2. Baseline the existing DB with `prisma migrate resolve --applied <migration_name>` and add manual SQL migration steps.
3. Use a fresh database (`evaluateme_v3` or `evaluateme_test`) for clean development.

## 2026-08-10 — Remote MySQL configured

- Created `evaluateme_v3` and `evaluateme_test` databases on `192.168.1.132`.
- Granted privileges to `evaluateme_dev`@'%' on both databases.
- Synced Prisma schema to `evaluateme_v3` (dev DB) and `evaluateme_test` (test DB via force-reset).
- API dev server now uses `DATABASE_URL=mysql://evaluateme_dev@192.168.1.132:3306/evaluateme_v3`.
- Health check returns `database: ok`.

## Dev servers — 2026-08-10 (remote DB)

- API dev server: `http://localhost:40001`
- Web dev server: `http://localhost:4000`
- Smoke tests passed against remote `evaluateme_v3`:
  - `POST /api/v1/auth/register` → user created.
  - `POST /api/v1/auth/login` → JWT tokens issued.
  - `GET /api/v1/health` → `database: ok`.
  - `GET /login` → 200.
  - `GET /technologies` without auth → 307 redirect to `/login`.

## 2026-08-10 — Legacy data migration

- Migrated data from `evaluateme_db` to `evaluateme_v3`:
  - `Technologies` → `technologies`: 19 rows.
  - `Questions` → `questions`: 6535 rows.
  - `Answer` → `answers`: 26460 rows (19 answers skipped due to missing questions).
- Mapped old integer IDs to UUIDs for new schema.
- Generated slugs for technologies; deduplicated conflicting names.
- Skipped 19 orphan answers referencing `QuestionID` 0 or missing questions.

## 2026-08-10 — CORS fix

- Added `app.enableCors()` in `apps/api/src/main.ts` allowing requests from `http://localhost:4000`.
- Added `WEB_ORIGIN=http://localhost:4000` to `.env.local`.
- Restarted API dev server.
- Verified preflight and login requests from web origin return correct CORS headers.

## 2026-08-10 — httpOnly cookie authentication

- Backend now sets `access_token` and `refresh_token` as httpOnly cookies on login.
- Backend reads refresh token from cookie during refresh/logout when body missing.
- Frontend switched from `localStorage` to cookies for token storage.
- Middleware verifies `access_token` cookie to protect routes.
- Updated auth response schemas and unit tests accordingly.

## 2026-08-10 — Middleware static asset fix

- Updated `middleware.ts` to explicitly allow `/_next/*`, `/static/*`, and `/favicon.ico`.
- Prevents 404 errors on Next.js static chunks in dev mode.

## 2026-08-10 — Fix web API URL

- Added `apps/web/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:40001`.
- Restarted web dev server to pick up correct API origin.

## 2026-08-10 — Auth flow verified

- User successfully logged in via web UI.
- Technologies page displays the imported list of 19 technologies.
- No application errors; remaining console messages were from browser extensions.

## 2026-08-10 — Automatic access token refresh

- Updated `api-client.ts` to intercept 401 responses and call `POST /api/v1/auth/refresh`.
- Refresh uses httpOnly `refresh_token` cookie.
- Failed refresh redirects to `/login`.
- Concurrent 401 requests share a single refresh promise to avoid multiple refresh calls.
- Added unit tests for retry on 401 and refresh failure.

## 2026-08-10 — Test Engine MVP

- Added domain entities and Prisma tables: `TestSession`, `UserAnswer`.
- Implemented use-cases: `StartTestUseCase`, `SubmitAnswerUseCase`, `GetTestSessionUseCase`.
- Implemented Prisma repositories for `Question`, `Answer`, `TestSession`.
- Created `TestsController` with protected `POST /api/v1/tests/start`, `GET /api/v1/tests/:sessionId`, `POST /api/v1/tests/:sessionId/answer`.
- Created `JwtAuthGuard` to verify `access_token` cookie on protected endpoints.
- Added frontend pages: `/technologies/[slug]/start` and `/tests/[sessionId]`.
- Added test-engine API client methods and schemas.
- Added unit tests for start and submit-answer use-cases.
- All backend and frontend builds pass; tests pass.

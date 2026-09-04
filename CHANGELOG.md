# Development Log

## 2026-09-02 — User profile, password change and password reset

- Added user profile management:
  - Backend `UpdateProfileUseCase` and `PUT /api/v1/auth/me` endpoint for updating email and username.
  - Frontend `/profile` page with profile details form.
- Added password change flow:
  - Backend `ChangePasswordUseCase` and `POST /api/v1/auth/change-password` endpoint.
  - Requires current password, strong new password, and password confirmation.
  - Sends `password_changed` email notification after a successful change.
  - Frontend "Privacy & Security" section on `/profile` with password strength indicator.
- Added password reset flow:
  - Backend `ForgotPasswordUseCase` and `POST /api/v1/auth/forgot-password` endpoint.
  - Generates a secure SHA-256 hashed token stored in the new `password_reset_tokens` table.
  - Sends `password_reset` email with a reset link.
  - Backend `ResetPasswordUseCase` and `POST /api/v1/auth/reset-password` endpoint validates the token and sets a new strong password.
  - Frontend `/forgot-password` request page and `/reset-password` confirmation page.
- Introduced strong password policy (min 12 chars, uppercase, lowercase, digit, special char, no repeated sequences) shared between backend and frontend.
- Added email infrastructure:
  - Domain `IEmailService` port.
  - `ConsoleEmailService` for local development and `NodemailerEmailService` for production SMTP.
  - Added `password_changed` email template to the seed.
- Added unit tests for `ChangePasswordUseCase` and `ResetPasswordUseCase`.
- Updated existing `LoginUseCase` tests to match current error messages.
- Added `findAll` to `IQuestionRepository` and `IQuizSessionRepository` ports and Prisma implementations.
- Verified production builds pass for `apps/api` and `apps/web`.

## 2026-09-02 — Extended user profile fields
## 2026-09-02 — Register / profile UI refinements and auth-aware technology page

- Moved **Account type** selector to the top of the `/register` form and made the form conditional:
  - **Personal** shows Last name, First name, Middle name and required Date of birth.
  - **Company** shows a single required **Company name** field and hides Date of birth / personal name fields.
- Added `companyName` support to backend `RegisterUseCase` and Zod schemas.
- Replaced country `<select>` with a searchable `CountryAutocomplete` dropdown with emoji flags on `/register` and `/profile`.
- Added a gentle `form-reveal` CSS animation when switching account type on `/register`.
- Redesigned `/register` left panel to place the headline at the top and fill remaining space with the existing `/landing/Mockup-Generated-by-Dunnnk.png` image.
- Made the Email field on `/profile` read-only/disabled.
- Added `apps/web/src/lib/auth/session.ts` with `getSessionUser` for server-side auth checks in public pages.
- Updated `/technologies/[slug]/start` to hide the "Sign up / Log in" sidebar CTA for authenticated users.
- Updated `CHANGELOG.md` and `docs/SESSION-LOG.md`.


- Extended `User` model with profile fields:
  - `firstName`, `lastName`, `middleName`, `birthDate`, `country`, `city`, `phone`.
  - Created and applied migration `20250902000000_add_user_profile_fields`.
- Updated domain `User` entity and `PrismaUserRepository` to map the new fields.
- Updated `RegisterUseCase`, `UpdateProfileUseCase`, and `GetMeUseCase` to accept and return the new profile fields.
- Updated backend Zod schemas (`register`, `updateProfile`, `me`) for the new fields.
- Updated frontend Zod schemas, `AuthContext` `UserProfile`, and auth API types for the new fields.
- Redesigned frontend `/register` form:
  - Username is now required.
  - Added required fields: last name, first name, date of birth, country of residence.
  - Added optional middle name, city, phone.
  - Added country selector with emoji flags (`apps/web/src/lib/countries.ts`).
- Extended frontend `/profile` form to allow editing all new profile fields.
- Fixed logout auto-relogin race condition:
  - `AuthContext.handleLogout` now uses plain `fetch` instead of `apiLogout` to avoid automatic `refresh-on-401`.
  - Added `?logged-out=1` flag and skip `getMe()` restore after logout.
  - Increased reload delay to 400 ms.
- Updated backend `OAuthLoginUseCase` and legacy migration to provide defaults for the new user fields.
- Updated contract tests for the new register request/response shapes.
- Updated `apps/web/tests/unit/lib/auth.api.test.ts` for the new register payload.
- Verified `npm run build` passes for both workspaces and auth unit tests pass.

- Smoke-tested the full flow against the running dev servers:
  - `PUT /api/v1/auth/me` updates profile.
  - `POST /api/v1/auth/change-password` changes password and sends email notification.
  - `POST /api/v1/auth/forgot-password` creates a reset token and sends reset email.
  - `POST /api/v1/auth/reset-password` validates token and sets a new password.
  - `/profile`, `/forgot-password`, and `/reset-password` frontend pages render correctly.

## 2026-08-31 — Landing page backend integration and logout fix

- Fixed stale admin header after logout:
  - Set frontend logout-in-progress flag before clearing state to stop the automatic refresh-on-401 flow.
  - Replaced `window.location.href` with `window.location.replace` and added a short delay to let `Set-Cookie` clear headers propagate before the reload.
  - Updated `AuthContext` and `api-client` to coordinate logout state.
- Wired landing page calculators to real backend prices:
  - Added `personal_credit_price`, `company_access_code_price`, `personal_bonus_credits_default`, and `company_bonus_credits_default` to known credit-setting keys.
  - Created `/api/v1/public-info` endpoint returning live credit settings and counters.
  - Created `/api/credit-price` edge route and updated the landing page user calculator to use the dynamic EvaluateMe price.
- Populated landing counters from the database:
  - Added `findAll` to `IQuestionRepository` and `IQuizSessionRepository` ports and Prisma implementations.
  - Public-info endpoint now reads `technologies`, `users`, `questions`, and completed `quiz_sessions` counts.
- Connected contact form to email notification:
  - Updated `/api/contact` to validate input and call a configurable SMTP relay endpoint (`SMTP_ENDPOINT`).
  - Falls back to logging the submission when no relay or admin email is configured.
  - Reads `CONTACT_ADMIN_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `SMTP_ENDPOINT` from environment variables.
- Verified production builds pass for both `apps/api` and `apps/web`.
- Verified `/api/v1/public-info` returns live counters: technologies=19, users=1, questions=6534, testsPassed=0.

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

## 2026-08-10 — Test Engine MVP (continued)

- Fixed `JwtAuthGuard` to inject `IJwtStrategy` instead of `JwtStrategyAdapter` concrete.
- Exported `IJwtStrategy` from `AuthModule` so `TestEngineModule` can use the guard.
- Smoke test for full test lifecycle:
  - Start a test for the "c" technology.
  - Fetch all questions and submit the first answer for each question.
  - Final session status becomes `completed` and returns a score.
- All 19 backend unit test suites / 52 tests passed after changes.

## 2026-08-11 — Test Engine candidate session flow

- Fixed `createdAt`/`updatedAt` types in `Question`, `Answer`, `FreeSampleQuestion` entities to use `Date` consistently.
- Removed duplicate `question.entity.ts` and `answer.entity.ts` from `packages/domain`.
- Added `validateSingleChoice` helper to `test.entity.ts`.
- Updated `SessionStrategyAdapter` to match domain `ISessionStrategy` interface (`issueSessionToken`, `verifySessionToken`, `revokeSessionToken`).
- Added `PrismaAccessCodeRepository` and added `updatedAt` to the `AccessCode` Prisma model.
- Implemented `StartSessionUseCase` for access-code candidate flow.
- Created `SessionsController` with `POST /api/v1/sessions/start`.
- Exported `ISessionStrategy` from `AuthModule` for `TestEngineModule` reuse.
- Added unit tests for `StartSessionUseCase` and updated `SessionStrategyAdapter` tests.
- All unit tests pass; TypeScript build (`tsc -b`) passes for domain, prisma, api, and web.

## 2026-08-11 — Test Engine contract, integration, and frontend tests

- Added contract tests for test-engine DTO schemas.
- Added integration tests for authenticated test flow and candidate access-code flow.
- Added frontend unit tests for `/technologies/[slug]/start` and `/tests/[sessionId]` pages.
- Updated `specs/008-08-test-engine/tasks.md` to mark all completed items.
- All unit, contract, and integration tests pass.

## 2026-08-11 — Auth persistent token blacklist

- Added `TokenBlacklistEntry` entity to `packages/domain`.
- Added `token_blacklist` Prisma table with `tokenHash` unique index and `expiresAt`.
- Implemented `PrismaTokenBlacklist` storing SHA-256 hashes with hourly cleanup of expired entries.
- Wired `PrismaTokenBlacklist` into `AuthModule` as the production `ITokenBlacklist` implementation.
- Preserved `InMemoryTokenBlacklist` as a lightweight fallback for tests/local use.
- Marked automatic access-token refresh and persistent blacklist tasks as completed in `specs/005-05-auth/tasks.md`.
- Added unit and integration tests verifying logout blocks subsequent refresh.

## 2026-08-11 — Security MVP (006-06-security)

- Wrote `specs/006-06-security/spec.md` and `tasks.md` defining rate limiting, security headers, RBAC, and audit logging user stories.
- Added `IRateLimitStore` port, `InMemoryRateLimitStore`, `RateLimitGuard`/`@RateLimit()` decorator.
- Applied rate limiting to all `/api/v1/auth/*` endpoints.
- Added `SecurityHeadersMiddleware` setting `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Content-Security-Policy`, and `Permissions-Policy` on every API response.
- Added `@Roles()` decorator and `RolesGuard` for role-based access control; exported from `AuthModule`.
- Added `ISecurityAuditLogger` domain port, `LogSecurityEventUseCase` application service, and `ConsoleSecurityAuditLogger` infrastructure adapter.
- Emitted `AUTH_LOGIN_FAILURE` security audit event from `AuthController`.
- Added unit and integration tests for rate limiting, security headers, RBAC, and audit logging.
- All unit, contract, and integration tests pass.

## 2026-08-11 — Architecture Phase 5 completion (001-01-architecture)

- Verified and marked all Phase 5 (US3) module-boundary tasks as completed in `specs/001-01-architecture/tasks.md`.
- Confirmed existing implementation covers: contract/integration/unit tests for technologies catalog, `modules.md` catalog, `adr-003-module-boundaries.md`, `Technology` entity, `ITechnologyRepository`, `ListTechnologiesUseCase`, `PrismaTechnologyRepository`, `TechnologiesController`, `TechnologiesModule`, `scripts/check-module-cycles.sh`, and frontend `/technologies` page.
- Architecture foundation is now fully tracked as complete.

## 2026-08-12 — Email template seed data and HTML preview

- Added `packages/prisma/src/seed.ts` with 6 default email templates:
  - `welcome_personal` — personal account welcome + email verification.
  - `welcome_company` — corporate account welcome + email verification.
  - `password_reset` — password reset request.
  - `invoice_payment_receipt` — invoice/payment receipt.
  - `test_invitation` — candidate test invitation with access code.
  - `test_results` — candidate test results notification.
- All templates are in English and use placeholder variables such as `{{userName}}`, `{{companyName}}`, `{{verificationLink}}`, `{{resetLink}}`, `{{orderNumber}}`, `{{testName}}`, `{{candidateName}}`, `{{accessCode}}`, `{{score}}`, etc.
- Added `db:seed` script to `packages/prisma/package.json` and registered `seed = "ts-node src/seed.ts"` in `schema.prisma`.
- Installed `ts-node` as a dev dependency for the prisma workspace.
- Seeded templates into the `evaluateme_v3` database; verified with `Seeded 6 email templates.`.
- Improved `/admin/email-templates` editor:
  - Added a **Code / Preview** toggle for the HTML body field.
  - Preview renders the email as a real email using an isolated `iframe` (`sandbox=""`) so styles, colors, buttons, and layout display correctly.
  - Preview now renders at full editor width with adequate height instead of a narrow column.
  - Code mode keeps the existing HTML source editor.

## 2026-08-12 — Admin questions list scroll progress bar

- Added a scroll progress bar to the questions list header on `/admin/technologies/[id]/questions`.
- Progress is calculated from the list's `scrollTop` relative to `scrollHeight - clientHeight`.
- Bar is rendered directly below the "Existing Questions" heading using the existing accent color.
- Committed as `14120e1 feat(admin): add scroll progress bar to questions list header`.

## 2026-08-13 — Public landing page with savings calculators

- Replaced the minimal home page with a full marketing landing page based on the legacy `evaluateme.it` design.
- Added an auto-rotating hero slider with Access Codes, Credits, Result Code, Private and Corporate accounts.
- Added an "About" feature grid with icons and value propositions.
- Added interactive savings calculators:
  - User calculator compares EvaluateMe price ($3/test) vs. other platforms and shows total savings.
  - Corporate calculator estimates interview costs and shows money saved by filtering candidates with Access Codes.
- Added a "How it works" showcase with Read More / Read Less details for Access codes, Accounts, Quiz process and Quiz results.
- Added an animated counters section pulled from `/api/counters` (edge route).
- Added a "Get in Touch" contact form backed by `/api/contact` (edge route).
- Copied legacy landing images into `apps/web/public/landing/`.
- Updated `globals.css` with range-slider accent utilities.

## 2026-09-03 — Quiz start flow, Result Code, Dashboard and buy credits stub

### Added
- Personal users can start a quiz from `/technologies`; credits are checked/deducted and a modal offers buying more credits when balance is insufficient.
- `/buy-credits` stub page for purchasing credits.
- Personal `/dashboard` with test result cards, copyable Result Code and detailed result page with charts.
- Public `/result` page to view any quiz result by Result Code.
- Home page Result Code lookup section redirecting to `/result?code=...`.
- Backend endpoints `GET /api/v1/me/results`, `GET /api/v1/me/results/:resultCode`, `POST /api/v1/tests/personal/start` and `GET /api/v1/public/results/:resultCode`.
- `quiz_result` email template and `SendQuizResultEmailUseCase` ready for future completion flow.
- 5 generated test results for `test.user@example.com`.

### Changed
- `Header` now shows **Dashboard** and **Buy credits** links for personal users.
- `middleware.ts` keeps `/result` public.

### Deferred
- Real quiz session creation and result email dispatch until the quiz engine is fully implemented.
- Real payment processing on `/buy-credits`.

## [2026-09-04]

### Added
- Technology preview endpoint () returns sample question with answers, question count, duration and credit price.
- Quiz settings keys  and  seeded with defaults (20 questions, 2 minutes per question).
- Technology detail page shows sample question, quiz question count, time limit and price for personal users.
- Confirmation dialog before starting a personal quiz displays the real credit price and only deducts credits after the user clicks "Yes".
- Test session page displays a start screen with the configured question count and duration before the timer begins.

### Changed
-  now triggers a parent-provided confirmation flow instead of immediately deducting credits.
-  and  use cases read question count and duration from credit settings.

## [2026-09-04]

### Fixed
- Quiz session now uses the configured `test_question_count` snapshot instead of all technology questions, so duration and question count match preview settings.

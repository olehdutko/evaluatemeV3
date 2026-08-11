# Feature Specification: Admin Panel

**Feature Branch**: `012-12-admin`

**Created**: 2026-08-11

**Status**: Draft

**Input**: Admin user stories covering account separation, hidden admin login, credit/pricing configuration, email templates, landing ads, user management, and content management (technologies, questions, answers).

## User Scenarios & Testing

### User Story 1 — P1: Hidden Admin Login and Role Separation

As a security owner, I want the standard login screen to reject admin users and provide a separate, non-public admin login path so that admin access is not exposed on the public surface.

**Why this priority**: Prevents brute-force attacks against admin accounts and keeps admin UI unlisted.

**Independent Test**: Attempt to log in as admin on `/login` and verify `403 Forbidden`. Then log in via `/admin/login` and verify success.

**Acceptance Scenarios**:

1. **Given** an admin email on `/login`, **When** submitted, **Then** the API returns `403 ADMIN_LOGIN_FORBIDDEN`.
2. **Given** an admin email on `/admin/login`, **When** valid credentials are submitted, **Then** the API returns tokens and the user is redirected to `/admin/dashboard`.
3. **Given** a non-admin user on `/admin/login`, **When** submitted, **Then** the API returns `403 FORBIDDEN`.

### User Story 2 — P1: Admin Dashboard and Layout

As an admin, I need a dedicated admin dashboard with navigation so that I can access all admin tools from a single place.

**Why this priority**: Centralizes admin workflows and separates admin UI from public UI.

**Independent Test**: Render `/admin/dashboard` and confirm navigation links to all admin sections exist.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they open `/admin/dashboard`, **Then** they see navigation to Technologies, Pricing, Credit Settings, Email Templates, Landing Ads, Users.
2. **Given** a non-admin authenticated user, **When** they open `/admin/dashboard`, **Then** they are redirected to `/` or `/technologies`.

### User Story 3 — P1: Technology Pricing (Free / Paid + Credit Cost)

As an admin, I want to mark technologies as free or paid and set the credit cost per quiz so that the platform can enforce paid content.

**Why this priority**: Core to monetization and credit economy.

**Independent Test**: API integration test updates a technology's pricing fields and verifies persistence.

**Acceptance Scenarios**:

1. **Given** a technology, **When** the admin toggles `isFree` to `true`, **Then** users can take quizzes for that technology at zero credits.
2. **Given** a paid technology, **When** the admin sets `creditCost` to `5`, **Then** starting a quiz deducts 5 credits.
3. **Given** a technology list in admin, **When** the page loads, **Then** each row shows current `isFree` and `creditCost` values.

### User Story 4 — P1: Credit Settings

As an admin, I want to configure global and per-company free credits and prices so that onboarding and purchases work consistently.

**Why this priority**: Required before any payment or credit flow can be trusted.

**Independent Test**: API integration test reads and updates `credit_settings` keys.

**Acceptance Scenarios**:

1. **Given** the admin credit settings page, **When** the admin sets `personal_bonus_credits_default`, **Then** new personal accounts receive that amount automatically.
2. **Given** a company profile, **When** the admin sets `available_tests` / `available_access_codes`, **Then** the company sees the bonus immediately.
3. **Given** pricing settings, **When** the admin updates `personal_credit_price` or `company_access_code_price`, **Then** the checkout uses the new price.

### User Story 5 — P2: Email Templates

As an admin, I want to edit email templates for activation and test-completion emails so that communication matches the brand.

**Why this priority**: Allows customization without code changes.

**Independent Test**: Contract test validates CRUD shapes; UI test renders editor with variables help.

**Acceptance Scenarios**:

1. **Given** the email templates page, **When** the admin edits the personal activation template, **Then** the new `bodyHtml` is saved under the `personal_activation` key.
2. **Given** a template editor, **When** rendered, **Then** it shows available variables (e.g., `{{activationLink}}`, `{{email}}`, `{{score}}`).

### User Story 6 — P2: Landing Ads

As an admin, I want to inject HTML advertising content on the landing page so that marketing messages can be updated without deployment.

**Why this priority**: Marketing needs rapid landing-page changes.

**Independent Test**: UI smoke test renders the landing page with the active ad HTML.

**Acceptance Scenarios**:

1. **Given** an active landing ad, **When** the home page loads, **Then** the ad HTML appears in a dedicated section.
2. **Given** the admin landing ad editor, **When** the admin saves HTML, **Then** it is persisted and immediately reflected on the next home-page load.

### User Story 7 — P2: User Management (Block / Unblock / Bonus)

As an admin, I want to see all personal and company accounts in separate grids with search/filter and manage their status and bonus credits/access codes.

**Why this priority**: Operational support and fraud prevention.

**Independent Test**: Integration test lists users by role, blocks a user, and verifies `activationStatus` changes.

**Acceptance Scenarios**:

1. **Given** the users page, **When** the admin switches to the Personal tab, **Then** only users with `role = 'user'` are shown.
2. **Given** a user row, **When** the admin clicks Block, **Then** the user's `activationStatus` becomes `suspended` and login fails.
3. **Given** a personal user, **When** the admin adds 10 bonus credits, **Then** the user's balance increases by 10.
4. **Given** a company profile, **When** the admin adds 5 bonus access codes, **Then** `available_access_codes` increases by 5.

### User Story 8 — P2: Technology, Question, and Answer Management

As an admin, I want full CRUD over technologies, their questions, and answer options so that test content can be maintained without code.

**Why this priority**: Core content management; the platform is useless without editable tests.

**Independent Test**: End-to-end test creates a technology, adds a question with answers, marks one correct, edits it, and deletes it.

**Acceptance Scenarios**:

1. **Given** the admin technologies page, **When** the admin creates a technology, **Then** it appears in the public catalog.
2. **Given** a technology, **When** the admin adds a question with multiple answers and marks one as correct, **Then** the question is available in test generation.
3. **Given** an existing question, **When** the admin edits content or toggles the correct answer, **Then** the changes persist.
4. **Given** an existing answer, **When** the admin deletes it, **Then** it is removed from the question.

### User Story 9 — P3: Two-Factor Authentication for Admin Login (Deferred)

As a security owner, I want admin login to require 2FA so that compromised passwords alone cannot access admin functions.

**Why this priority**: High security value, but requires TOTP/SMS infrastructure and is deferred to a later sprint.

**Independent Test**: TBD.

**Acceptance Scenarios**: TBD.

## Requirements

### Functional Requirements

- **FR-001**: Standard `/api/v1/auth/login` MUST reject users with `role = 'admin'` with `403 ADMIN_LOGIN_FORBIDDEN`.
- **FR-002**: A hidden `/api/v1/auth/admin-login` endpoint MUST authenticate only users with `role = 'admin'`.
- **FR-003**: Admin frontend MUST live under `/admin/*` and use a distinct admin layout.
- **FR-004**: Non-admin users MUST be redirected away from `/admin/*` routes.
- **FR-005**: Admin dashboard MUST link to all admin sections.
- **FR-006**: `Technology` MUST support `isFree: boolean` and `creditCost: int`.
- **FR-007**: Admin MUST be able to CRUD `credit_settings` keys.
- **FR-008**: Admin MUST be able to edit `EmailTemplate` records.
- **FR-009**: Admin MUST be able to edit the active `LandingAd`.
- **FR-010**: Admin MUST be able to list users by role, block/unblock, and add bonus credits/access codes.
- **FR-011**: Admin MUST be able to CRUD technologies, questions, and answers.

### Key Entities

- **Technology**: now includes `isFree`, `creditCost`.
- **CreditSetting**: key-value store for prices and default free credits.
- **CompanyProfile**: `availableTests`, `availableAccessCodes` are updated by admin for bonus grants.
- **EmailTemplate**: keyed templates for activation/completion emails.
- **LandingAd**: single active HTML ad for the home page.

## Success Criteria

- **SC-001**: Admin cannot log in via public `/login`; hidden admin login works.
- **SC-002**: `/admin/*` routes are protected by role checks.
- **SC-003**: Technology pricing can be toggled and credit cost edited in admin UI.
- **SC-004**: Credit settings page reads and writes all required keys.
- **SC-005**: Email templates and landing ad editor save and reflect changes.
- **SC-006**: User grids support search, filter, block/unblock, bonus credits/access codes.
- **SC-007**: Technology/question/answer CRUD works end-to-end.
- **SC-008**: All new admin features have backend and frontend tests.

## Architecture & Non-Functional Constraints

- Admin endpoints MUST reuse `RolesGuard` and `@Roles('admin')` from `006-06-security`.
- Admin UI MUST follow the warm-brutalist design system.
- No Docker or container-dependent workflows.
- 2FA is explicitly out of scope for this sprint and marked as future work.

## Future Extensions

- TOTP-based 2FA for admin login.
- Audit log of admin actions.
- Bulk import of questions/answers.
- Admin impersonation for support.

# Feature Specification: Shared Data Model

**Feature Branch**: `002-02-data-model`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Define the shared v3 domain entities, Prisma schema, and repository ports that all subsequent features will build on."

## User Scenarios & Testing

### User Story 1 — P1: Core v3 Entities & Repository Ports

As a backend developer, I need typed domain entities and repository ports for `User`, `CompanyProfile`, `Campaign`, `Technology`, `Test`, `Question`, `Answer`, `AccessCode`, `Order`, `EmailTemplate`, `LandingAd`, and `CreditSetting` so that all features can depend on a single, stable contract.

**Why this priority**: Without shared entities and ports, every feature reinvents boundaries and creates coupling. This story establishes the vocabulary all later features use.

**Independent Test**: Unit tests assert each entity can be constructed with valid data and rejected on invalid state. Ports are interfaces without implementation; tests verify they exist and are exported from `packages/domain`.

**Acceptance Scenarios**:

1. **Given** a valid set of attributes, **When** constructing a `Test` entity, **Then** the entity exposes `id`, `title`, `technologyId`, `status`, `durationMinutes`, `passingScore`, `createdByUserId`, `createdAt`, `updatedAt`.
2. **Given** a `Question` with type `single_choice`, **When** validated, **Then** it stores `testId`, `content`, `type`, `orderIndex`, and `score`.

### User Story 2 — P2: Prisma Schema Alignment & Non-Destructive Migration

As a platform engineer, I need the Prisma schema and a version-controlled migration to reflect all v3 entities with correct MySQL types and natural-key constraints so that the database matches the domain model.

**Why this priority**: The schema is the physical contract. Aligning it now prevents future migration conflicts and allows repositories to be implemented against a single source of truth.

**Independent Test**: Run `npx prisma migrate status` against a local MySQL copy and confirm one new migration is pending and contains only additive, non-destructive changes.

**Acceptance Scenarios**:

1. **Given** the current schema, **When** `npx prisma migrate diff` is run, **Then** no `DROP` or destructive `ALTER` statements are generated for existing tables.
2. **Given** a migration file, **When** it is inspected, **Then** it adds `users`, `company_profiles`, `campaigns`, `campaign_history`, `technologies`, `tests`, `questions`, `answers`, `free_sample_questions`, `access_codes`, `orders`, `email_templates`, `landing_ads`, `credit_settings` if they do not already exist.

### User Story 3 — P3: Legacy Tables as Read-Only Reference Models

As a migration engineer, I need Prisma models for legacy MyISAM tables (read-only) so that the one-time migration job can read legacy data without writing to it.

**Why this priority**: This enables the existing migration runner to read from legacy tables using the same Prisma client, but it is not required for the core v3 entity contracts.

**Independent Test**: Prisma introspection or manual models expose legacy tables with `@@map("legacy_name")` and no `@@id` or write operations in tests.

**Acceptance Scenarios**:

1. **Given** legacy `Students`, `Results`, `Candidates`, `Candidates_results` tables, **When** Prisma client is generated, **Then** read-only models are available under `packages/prisma`.

## Requirements

### Functional Requirements

- **FR-001**: Domain entities for all v3 business objects MUST exist in `packages/domain/src/entities/`.
- **FR-002**: Repository ports for every entity MUST exist in `packages/domain/src/ports/`.
- **FR-003**: Prisma schema in `packages/prisma/schema.prisma` MUST model all v3 tables with MySQL native types and natural-key unique constraints.
- **FR-004**: A version-controlled migration MUST add any missing v3 tables without destructive changes to existing tables.
- **FR-005**: Legacy tables MUST be modeled as read-only references (no writes in production feature code).
- **FR-006**: Enum/string status values MUST match the state machines documented in `specs/001-01-architecture/data-model.md`.

### Key Entities

- **User**: unified account (personal user, company, admin).
- **CompanyProfile**: company-specific fields linked 1:1 to a company `User`.
- **Campaign / CampaignHistory**: marketing campaigns and audit trail.
- **Technology**: catalog entry for tests and free sample questions.
- **Test / Question / Answer**: test authoring and question banks.
- **FreeSampleQuestion**: promotional question shown without authentication.
- **AccessCode**: code granting candidate access to a test.
- **Order**: payment/order record.
- **EmailTemplate / LandingAd / CreditSetting**: admin-managed content and configuration.

## Success Criteria

- **SC-001**: All v3 entities and ports compile under TypeScript strict mode.
- **SC-002**: Prisma generate succeeds and migration is non-destructive.
- **SC-003**: Legacy read-only models do not contain `@@id` or mutable operations in domain code.
- **SC-004**: No feature code outside Infrastructure imports Prisma models directly.

## Architecture & Non-Functional Constraints

- Business logic MUST be framework-independent and live in Domain and Application layers.
- External input MUST be validated; database access MUST use parameterized queries or equivalent safe bindings.
- Persistence MUST be abstracted so MySQL can be replaced by another SQL database without changing Domain or Application code.
- The feature MUST be testable with unit, integration, and API tests without Docker or container-dependent workflows.

## Assumptions

- The legacy `evaluateme` database exists and is reachable via `DATABASE_URL`.
- Existing legacy tables remain read-only during this feature.
- v3 entities may duplicate legacy data idempotently through the existing migration runner.

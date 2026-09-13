# Implementation Plan: Corporate Account Campaign Management

**Branch**: `014-corporate-account` | **Date**: 2026-09-13 | **Spec**: [specs/014-corporate-account/spec.md](specs/014-corporate-account/spec.md)

**Input**: Feature specification from `specs/014-corporate-account/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Enhance corporate accounts so company administrators can create campaigns, build private custom and personal quizzes, generate access codes within campaigns, send codes to candidates by email, and review campaign-scoped candidate results with a chronological change history. The existing corporate module already contains the foundational API endpoints and Prisma models; this feature closes the behavioral gaps identified during the specification audit (status-driven access-code disabling, company access-code limits, send history, partially-correct scoring, and UI workflows).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+

**Primary Dependencies**: NestJS (backend), Next.js + React + Tailwind (frontend), Zod (validation), Prisma (ORM), MySQL (database), Nodemailer/Console email adapters

**Storage**: MySQL via Prisma; existing tables `campaigns`, `campaign_history`, `access_codes`, `company_quizzes`, `candidate_results`, `questions`, `answers`, and `company_profiles` are reused and extended with additive migrations.

**Testing**: Jest for unit/integration tests; API tests run against an in-process NestJS app; Docker is prohibited per the Constitution.

**Target Platform**: Web (Next.js frontend, NestJS REST API).

**Project Type**: Web application with separate frontend and backend packages in a monorepo.

**Performance Goals**: Campaign history writes within 1 second of action; candidate results appear within 5 seconds of test completion; sub-200 ms p95 for list/detail reads under typical corporate load.

**Constraints**: No Docker; no destructive migrations to the legacy `evaluateme` database; additive, nullable Prisma migrations only; legacy read-only tables must not be written by feature code; framework code must stay out of Domain/Application layers.

**Scale/Scope**: Corporate accounts (company administrators and their candidates); expected load is low-to-moderate (hundreds of campaigns and thousands of access codes per company).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principles Verification

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture | PASS | Existing corporate use cases live in `apps/api/src/application/corporate/` and depend only on domain ports/entities. Controllers in `apps/api/src/modules/corporate/` are thin. The feature continues this pattern. |
| II. TypeScript Discipline | PASS | Project uses strict TypeScript and Zod schemas. No `any` or `@ts-ignore` expected in new production code. |
| III. Lightweight Use-Case Backend | PASS | Business logic is implemented through small, single-responsibility use cases injected into controllers. |
| IV. Persistence & Legacy Database Care | PASS | Required schema changes are additive/nullable migrations on existing v3 tables. Legacy read-only tables are untouched. |
| V. Testing, Validation & Security | PASS | Input validated with Zod; DB access via Prisma (parameterized queries); JWT + roles guards used. |
| VI. Modularity, Replaceability & Simplicity | PASS | Ports/adapters pattern already in place for repositories and email service. |
| VII. Spec-Driven Development & Documentation | PASS | Feature spec is the source of truth; this plan and forthcoming data model/contracts document decisions. |

### Constraint Verification

| Constraint | Status | Notes |
|------------|--------|-------|
| No Docker/container workflows | PASS | Tests run in-process; no container dependency introduced. |
| No destructive legacy migrations | PASS | Only additive, nullable columns and new v3 tables. |
| No framework code in Domain/Application | PASS | Use cases and entities are framework-free. |
| No global mutable state | PASS | Use cases receive dependencies via constructor injection. |

## Project Structure

### Documentation (this feature)

```text
specs/014-corporate-account/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/api/src/
├── application/corporate/
│   ├── campaigns/          # create, list, get, update status
│   ├── access-codes/       # create, list, send
│   ├── quizzes/            # custom & personal quiz creation/listing
│   └── results/            # list, detail
├── modules/corporate/
│   ├── campaigns.controller.ts
│   ├── access-codes.controller.ts
│   ├── quizzes.controller.ts
│   └── results.controller.ts
├── infrastructure/prisma/repositories/
│   ├── prisma-campaign.repository.ts
│   ├── prisma-access-code.repository.ts
│   ├── prisma-company-quiz.repository.ts
│   └── prisma-session-result.repository.ts
└── lib/schemas/corporate.schema.ts

apps/web/src/
├── app/campaigns/          # list, create, detail, results, result detail
├── app/quizzes/            # custom & personal quiz builders
├── components/campaigns/   # campaign UI components
├── components/quizzes/     # quiz builder components
└── lib/corporate-api.ts    # corporate API client helpers

packages/domain/src/
├── entities/               # Campaign, AccessCode, CompanyQuiz, CandidateResult, enums
└── ports/                  # repository and service interfaces

packages/prisma/
├── schema.prisma           # additive changes only
└── migrations/             # versioned additive migrations
```

**Structure Decision**: The repository is a NestJS + Next.js monorepo. This feature extends the existing `corporate` vertical without adding new packages or projects, keeping the structure aligned with the current Clean Architecture layout.

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts generated.*

| Principle / Constraint | Status | Notes |
|------------------------|--------|-------|
| I. Clean Architecture | PASS | No new infrastructure dependencies introduced in design; use cases remain framework-free. |
| II. TypeScript Discipline | PASS | Contracts use explicit JSON types; implementation will continue strict TypeScript. |
| III. Lightweight Use-Case Backend | PASS | Feature is implemented by extending existing small use cases, not adding heavy frameworks. |
| IV. Persistence & Legacy Database Care | PASS | Data model confirms no new tables or destructive migrations are required. |
| V. Testing, Validation & Security | PASS | Zod schemas and parameterized DB access remain in place. |
| VI. Modularity, Replaceability & Simplicity | PASS | Existing ports/adapters are reused; no premature abstractions added. |
| VII. Spec-Driven Development & Documentation | PASS | Spec, plan, research, data-model, contracts, and quickstart are all generated. |
| No Docker/container workflows | PASS | Quickstart uses local API/web servers only. |
| No destructive legacy migrations | PASS | Design relies on existing v3 tables. |
| No framework code in Domain/Application | PASS | Data model and contracts do not introduce framework-specific constructs. |
| No global mutable state | PASS | Design preserves constructor injection and explicit configuration. |

## Complexity Tracking

> No Constitution Check violations require justification.

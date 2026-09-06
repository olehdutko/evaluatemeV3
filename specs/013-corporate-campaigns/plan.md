# Implementation Plan: Corporate Campaigns Management

**Branch**: `013-corporate-campaigns` | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-corporate-campaigns/spec.md`

## Summary

Extend the EvaluateMe v3 platform with a corporate module that lets company administrators create assessment campaigns, generate access codes linked to campaigns, build custom (existing-question) and personal (company-authored) quizzes scoped to their company, and review candidate test results within a campaign. The work leverages existing MySQL/Prisma storage, NestJS use-case architecture, and Next.js App Router while introducing new domain entities, repositories, controllers, and screens that respect the Clean Architecture dependency direction.

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20+

**Primary Dependencies**: NestJS 10, Next.js 14, React 18, Tailwind CSS, Zod, Prisma ORM, MySQL

**Storage**: MySQL via Prisma, isolated behind repository/port abstractions. New schema changes delivered via version-controlled Prisma migrations.

**Testing**: Jest + Supertest for unit and API tests without Docker.

**Target Platform**: Web application: NestJS API on port 4001, Next.js frontend on port 4000.

**Project Type**: Web application (backend + frontend), monorepo.

**Performance Goals**: Campaign list and access code grid load within 2 seconds for up to 1,000 records per company; result detail renders within 3 seconds.

**Constraints**: No Docker; legacy database data must be preserved; domain/application layers cannot depend on infrastructure/presentation; TypeScript strict mode; no `any` in production code.

**Scale/Scope**: Initial target is small-to-medium corporate accounts with up to tens of campaigns, thousands of access codes, and custom/personal quizzes stored per company.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clean Architecture**: ✅ Feature will define domain ports and application use cases before Prisma/NestJS implementations.
- **TypeScript Discipline**: ✅ All new public APIs must be strictly typed; no `any`.
- **Lightweight Use-Case Backend**: ✅ Business logic implemented in use cases, thin controllers.
- **Persistence & Legacy Database Care**: ⚠️ Existing schema already contains `Campaign`, `CampaignHistory`, `AccessCode`, `CandidateResult`, `CandidateSession`, `CompanyProfile`. We will analyze and reuse these tables with migrations only for missing columns/relationships.
- **Testing, Validation & Security**: ✅ Input validated with Zod at boundaries; parameterized Prisma queries.
- **Modularity, Replaceability & Simplicity**: ✅ New `CorporateModule` for backend; new page routes and components under `apps/web/src/app/campaigns` and `apps/web/src/components/campaigns`.
- **Spec-Driven Development & Documentation**: ✅ This plan and the spec are the source of truth.

## Project Structure

### Documentation (this feature)

```text
specs/013-corporate-campaigns/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # API/screen contracts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── src/
│   │   ├── modules/
│   │   │   └── corporate/
│   │   │       ├── corporate.module.ts
│   │   │       ├── corporate.controller.ts
│   │   │       ├── campaigns.controller.ts
│   │   │       ├── access-codes.controller.ts
│   │   │       ├── quizzes.controller.ts
│   │   │       └── results.controller.ts
│   │   ├── application/
│   │   │   └── corporate/
│   │   │       ├── campaigns/
│   │   │       │   ├── create-campaign.use-case.ts
│   │   │       │   ├── list-campaigns.use-case.ts
│   │   │       │   ├── update-campaign-status.use-case.ts
│   │   │       │   └── get-campaign.use-case.ts
│   │   │       ├── access-codes/
│   │   │       │   ├── create-access-code.use-case.ts
│   │   │       │   ├── list-access-codes.use-case.ts
│   │   │       │   └── send-access-code.use-case.ts
│   │   │       ├── quizzes/
│   │   │       │   ├── create-custom-quiz.use-case.ts
│   │   │       │   ├── create-personal-quiz.use-case.ts
│   │   │       │   ├── list-company-quizzes.use-case.ts
│   │   │       │   └── get-quiz-for-access-code.use-case.ts
│   │   │       └── results/
│   │   │           ├── list-campaign-results.use-case.ts
│   │   │           └── get-candidate-result-detail.use-case.ts
│   │   ├── infrastructure/
│   │   │   └── prisma/
│   │   │       └── repositories/
│   │   │           ├── prisma-campaign.repository.ts
│   │   │           ├── prisma-access-code.repository.ts
│   │   │           └── prisma-company-quiz.repository.ts
│   │   └── lib/schemas/
│   │       └── corporate.schema.ts
│   └── tests/
│       ├── unit/
│       │   └── corporate/
│       └── api/
│           └── corporate/
└── web/
    └── src/
        ├── app/
        │   ├── campaigns/
        │   │   ├── page.tsx            # list campaigns
        │   │   ├── [id]/
        │   │   │   └── page.tsx        # campaign detail / access codes / results
        │   │   └── [id]/results/
        │   │       └── [resultId]/
        │   │           └── page.tsx    # result detail
        │   └── quizzes/
        │       ├── custom/page.tsx     # create custom quiz
        │       └── personal/page.tsx   # create personal quiz
        ├── components/campaigns/
        │   ├── CampaignList.tsx
        │   ├── CampaignForm.tsx
        │   ├── CampaignStatusBadge.tsx
        │   ├── AccessCodeGrid.tsx
        │   ├── CreateAccessCodeForm.tsx
        │   ├── CampaignHistory.tsx
        │   ├── CampaignResults.tsx
        │   ├── ResultDetail.tsx
        │   └── ResultChart.tsx
        └── components/quizzes/
            ├── CustomQuizBuilder.tsx
            └── PersonalQuizBuilder.tsx
```

**Structure Decision**: Option 2 (Web application with backend + frontend). A dedicated `corporate` NestJS module keeps business logic isolated from admin and public modules; frontend pages follow existing Next.js App Router conventions under `app/campaigns` and `app/quizzes`.

## Complexity Tracking

No Constitution Check violations require justification at this stage. The feature introduces one new backend module and several new pages but stays within the existing two-project structure.

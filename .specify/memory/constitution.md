<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: n/a (initial adoption)
Added sections:
  - Core Principles (Clean Architecture; TypeScript Discipline; Lightweight Use-Case Backend;
    Persistence & Legacy Database Care; Testing, Validation & Security; Modularity,
    Replaceability & Simplicity; Spec-Driven Development & Documentation)
  - Additional Constraints
  - Development Workflow
  - Governance
Removed sections: n/a
Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gate already aligned; no edits needed)
  - ✅ .specify/templates/spec-template.md (mandatory sections align with constraints; no edits needed)
  - ✅ .specify/templates/tasks-template.md (unit/integration/API testing phases already present; no edits needed)
  - ✅ .opencode/commands/speckit.constitution.md (this command file; no outdated references found)
Deferred items: TODO(RATIFICATION_DATE): original adoption date unknown; set to project creation date 2026-08-08.
-->

# EvaluateMe.IT v3 Constitution

## Core Principles

### I. Clean Architecture

Dependency direction MUST be strictly Domain → Application → Infrastructure/Presentation.
Domain and Application layers MUST NOT import Infrastructure or Presentation packages.
Business logic MUST live in the Domain and Application layers and MUST be framework-independent.
Controllers, UI components, and external adapters MUST be thin and delegate work to application use cases/services.

**Rationale**: Controlling dependency direction keeps business rules isolated from frameworks and databases,
which is the foundation of testability, replaceability, and long-term maintainability.

### II. TypeScript Discipline

TypeScript MUST be configured in strict mode.
Production code MUST NOT use `any`, `@ts-ignore`, `@ts-nocheck`, or `@ts-expect-error`.
All public APIs, function signatures, and domain boundaries MUST use explicit, safe types.

**Rationale**: Type safety is a compile-time correctness gate. Disabling it turns TypeScript into a
costly lint layer rather than a reliable design tool.

### III. Lightweight Use-Case Backend

The backend MUST remain lightweight with only minimal, justified dependencies.
Business logic MUST be implemented through application use cases/services, not inside controllers or framework hooks.
External services and libraries MUST be isolated behind abstractions and injected from Infrastructure.

**Rationale**: Heavy frameworks make code brittle and hard to reason about. Use-case-driven design
keeps each feature small, replaceable, and easy to unit test.

### IV. Persistence & Legacy Database Care

MySQL is the primary database, with persistence isolated behind repository/port abstractions.
Domain and Application layers MUST NOT contain database-specific logic, direct SQL, or ORM calls.
SQL schema changes MUST be managed through version-controlled migrations.
The existing legacy `evaluateme` database MUST be analyzed, reused, and migrated carefully.
Existing data MUST be preserved whenever possible. Destructive migrations require explicit justification,
documentation, and approval before they may run.

**Rationale**: The legacy database contains real production data and continuity is non-negotiable.
Abstraction allows another SQL database to replace MySQL without touching Domain or Application code.

### V. Testing, Validation & Security

The project MUST support unit, integration, and API tests without Docker or container-dependent workflows.
External input MUST be validated at system boundaries.
Database access MUST use parameterized queries or equivalent safe bindings.
Configuration MUST be centralized, validated, and loaded explicitly. No global mutable state or hidden side effects are allowed.

**Rationale**: Security and correctness cannot be retrofitted. Validated input, safe queries, and explicit
configuration remove entire classes of bugs and vulnerabilities.

### VI. Modularity, Replaceability & Simplicity

Code MUST be organized around cohesive modules with low coupling.
Infrastructure and external services MUST remain replaceable through ports/adapters.
Development MUST follow SOLID, DRY, KISS, YAGNI, and Separation of Concerns.
Premature optimization and over-engineering are prohibited.

**Rationale**: Simplicity is a feature. Cohesive modules make the codebase easier to extend without
introducing accidental complexity.

### VII. Spec-Driven Development & Documentation

Specifications are the source of truth for every feature.
Important architectural decisions and database migrations MUST be documented.

**Rationale**: When specs and migrations are the single source of truth, the team can reason about
scope, impact, and history without relying on tribal knowledge.

## Additional Constraints

- Docker and all container-dependent workflows are strictly prohibited.
- Destructive changes to the legacy database require explicit justification and documented approval.
- Framework-specific code MUST NOT leak into Domain or Application layers.
- No global mutable state or hidden side effects are permitted.
- Prioritize correctness, maintainability, simplicity, testability, and extensibility.

## Development Workflow

1. Write or update the feature specification as the source of truth.
2. Run the Constitution Check before design and implementation.
3. Implement Domain and Application logic first; add Infrastructure adapters only when the ports are defined.
4. Write tests at the appropriate level (unit, integration, API) without Docker.
5. Validate external input and confirm safe database access before merging.
6. Document architectural decisions and migrations alongside the code.

## Governance

This constitution supersedes all other local conventions and practices.
Amendments require a documented rationale, version bump, and a migration or compatibility plan when applicable.
`CONSTITUTION_VERSION` follows semantic versioning: MAJOR for incompatible governance changes or principle
redefinitions; MINOR for new principles or materially expanded guidance; PATCH for clarifications,
wording, or typo fixes.
All pull requests and reviews MUST verify compliance with these principles.
Use `docs/architecture/` for architectural decision records and `packages/prisma/migrations/` for database migrations.

**Version**: 1.0.0 | **Ratified**: 2026-08-08 | **Last Amended**: 2026-08-09

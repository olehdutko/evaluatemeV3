# ADR-001: Clean Architecture with Strict Dependency Direction

## Status

Accepted

## Context

EvaluateMe.IT v3.0 requires a maintainable, testable, and framework-independent foundation. The legacy v2 system mixed business logic with framework-specific code and database access, making changes expensive and testing difficult. The project constitution mandates Clean Architecture with strict Domain → Application → Infrastructure/Presentation dependency direction.

## Decision

Adopt a four-layer Clean Architecture:

1. **Domain** (`packages/domain`): pure TypeScript entities, value objects, and repository ports.
2. **Application** (`apps/api/src/application`): use cases/services that orchestrate Domain objects.
3. **Infrastructure** (`apps/api/src/infrastructure`): Prisma repositories, config, logging, security adapters, migrations.
4. **Presentation**: NestJS controllers (`apps/api/src/modules`) and Next.js App Router pages (`apps/web/src/app`).

Dependency rule: Domain has no outgoing dependencies. Infrastructure implements Domain ports and is injected via NestJS DI. The frontend consumes the API over HTTP and does not access Domain internals directly.

## Consequences

### Positive

- Business rules are isolated from framework churn.
- Unit tests can run without a database or HTTP server.
- MySQL can be replaced by another SQL database by re-implementing repository ports.
- Static analysis enforces the dependency rule in CI.

### Negative

- More boilerplate than a framework-coupled approach.
- Developers must learn the port/adapter pattern.

## Enforcement

ESLint `import/no-restricted-paths` rejects imports from `@nestjs/*`, `@prisma/client`, `next`, and `react` into `packages/domain/src`. CI runs `npm run lint` on every PR.

## Related

- `docs/architecture/layers.md`
- `docs/architecture/legacy-database-mapping.md`
- Constitution principle I. Clean Architecture

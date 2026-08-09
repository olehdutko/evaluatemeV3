# Architecture Layers

## Layered Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Presentation (apps/web, apps/api controllers)              │
│  - Next.js App Router pages, React components               │
│  - NestJS Controllers (e.g., HealthController)              │
├─────────────────────────────────────────────────────────────┤
│  Application (apps/api application/use-cases)                 │
│  - HealthCheckUseCase                                        │
│  - Orchestrates Domain entities through ports               │
├─────────────────────────────────────────────────────────────┤
│  Domain (packages/domain)                                     │
│  - User, CompanyProfile, Campaign, Technology, Test,     │
│    Question, Answer, UserSession, UserResult entities        │
│  - Repository ports (IUserRepository, ITestRepository,     │
│    IHealthRepository, etc.)                                  │
│  - No imports from @nestjs/*, @prisma/client, next, react   │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure (apps/api infrastructure)                     │
│  - Prisma repositories (PrismaUserRepository)               │
│  - PrismaService, config, logging, migrations                │
│  - BcryptPasswordHasher, JWT/session strategy adapters     │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Direction

```
Presentation/API → Application → Domain
Infrastructure ↗
```

- **Presentation** and **Application** may depend on **Domain**.
- **Infrastructure** implements **Domain** ports and is injected from outside.
- **Domain** MUST NOT import from **Application**, **Infrastructure**, or **Presentation**.
- This direction is enforced by ESLint `import/no-restricted-paths` in CI.

## Where New Code Belongs

| Component | Belongs to | Example |
|-----------|-----------|---------|
| New use case | Application | `apps/api/src/application/health/...` |
| New entity / rule | Domain | `packages/domain/src/entities/...` |
| New repository interface | Domain | `packages/domain/src/ports/...` |
| New repository implementation | Infrastructure | `apps/api/src/infrastructure/prisma/repositories/...` |
| New API endpoint | Presentation (API controller) | `apps/api/src/modules/health/...` |
| New page | Presentation (Web) | `apps/web/src/app/...` |

## Enforcement

Run the architecture import check:

```bash
npm run lint
```

CI fails if `packages/domain/src` imports any of:
- `@nestjs/*`
- `@prisma/client`
- `next`
- `react`

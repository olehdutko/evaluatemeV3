# Research: Architecture Foundation

## 1. NestJS + Prisma with `mysql` provider for Clean Architecture layering

**Decision**: Use NestJS 10.x with Prisma 5.x (`mysql` provider) for the backend, and keep Prisma imports confined to the Infrastructure layer.

**Rationale**:
- NestJS provides a module system that naturally maps to the spec's module catalog (auth, users, campaigns, etc.).
- Prisma's `mysql` provider handles parameterized queries and connection pooling, satisfying the security and persistence-abstraction requirements.
- Repository pattern: define ports (`IUserRepository`) in `packages/domain`, implement them with `PrismaUserRepository` in `apps/api/src/infrastructure/prisma/repositories`, and inject through NestJS providers. This keeps Domain/Application free of `@prisma/client` imports.
- ESLint `import/no-restricted-paths` is used to enforce that `packages/domain` cannot import from `@nestjs/*`, `@prisma/client`, `next`, or `react`.

**Alternatives considered**:
- **FastAPI + SQLAlchemy**: Rejected because the spec standardizes on TypeScript/NestJS and the existing `.spec` documents leaned toward NestJS.
- **TypeORM**: Rejected because Prisma's schema-first migrations and type safety fit the constitution's strict-typing requirement more cleanly.

## 2. MyISAM → InnoDB conversion strategy for legacy tables

**Decision**: Do NOT convert legacy MyISAM tables during the architecture foundation. Create new v3 InnoDB tables for sessions and results, and keep legacy tables read-only until an explicit future migration justifies conversion.

**Rationale**:
- Converting MyISAM to InnoDB on production tables is a destructive-adjacent operation that requires explicit justification per the constitution.
- The architecture foundation can deliver value by reading legacy tables through Prisma views or raw read-only adapters, while new data flows into new InnoDB tables.
- Foreign keys will be added only after legacy tables are converted to InnoDB in a later, explicitly approved migration.

**Alternatives considered**:
- **Convert all legacy tables to InnoDB in architecture phase**: Rejected — too risky and violates the principle of preserving existing data unless explicitly justified.
- **Repurpose legacy MyISAM tables directly**: Rejected — the spec requires new v3 InnoDB tables for sessions/results.

## 3. Idempotent migration patterns for legacy sessions/results

**Decision**: One-time idempotent copy jobs using natural business keys.

**Rationale**:
- Natural keys are the only stable identifiers across legacy and v3 schemas without relying on auto-increment surrogate keys that may differ.
- Migration scripts check existence before insert, allowing re-runs without duplication.
- Original legacy rows are never modified or deleted; v3 tables act as the canonical write target after migration.

**Key mapping**:
| Legacy table | v3 table | Natural key |
|-------------|----------|-------------|
| `Students` | `user_sessions` | `session_id` + `question_id` |
| `Results` | `user_results` | `result_code` |
| `Candidates` | `candidate_sessions` | `session_id` + `question_id` |
| `Candidates_results` | `candidate_results` | `result_code` |

## 4. Monorepo tooling selection

**Decision**: Use npm workspaces for the monorepo root, with `packages/*` and `apps/*` workspaces.

**Rationale**:
- Minimal justified dependencies — npm workspaces require no extra tooling beyond Node.js/npm.
- Sufficient for the project scale (~2 apps + 3 packages).
- pnpm/Turborepo could be introduced later if build performance becomes a bottleneck, per YAGNI.

**Alternatives considered**:
- **pnpm workspaces**: Faster installs, but adds a non-default toolchain.
- **Turborepo**: Excellent for large repos, but overkill for the foundation phase.

## 5. Next.js App Router API client patterns

**Decision**: Use Next.js App Router server components for initial data fetching, and a lightweight typed REST client (wrapping `fetch`) for client-side mutations and API calls.

**Rationale**:
- Server components can call the NestJS API directly during SSR, improving SEO and reducing client-side waterfall.
- A typed client (using Zod for response validation) ensures contract alignment with backend `/api/v1/*` endpoints.
- No Next.js API routes are required as a BFF; the frontend talks directly to the NestJS backend.

**Alternatives considered**:
- **Next.js API routes as BFF**: Rejected — adds an unnecessary layer and contradicts the lightweight-backend principle.
- **GraphQL client**: Rejected — spec standardizes on REST with URL path versioning.

## 6. Authentication model selection

**Decision**: JWT for personal users and admins; session-based tokens for companies and candidates taking tests.

**Rationale**:
- JWTs give stateless access for the primary user/admin workflows, aligning with the lightweight use-case backend.
- Session-based tokens preserve the test-taking context and allow server-side invalidation if a candidate must be paused or re-authenticated.
- Token transport uses HTTP-only cookies for web and `Authorization: Bearer` for programmatic access.

**Alternatives considered**:
- **JWT for everyone**: Harder to invalidate candidate sessions mid-test.
- **Server-side sessions for everyone**: Adds a storage dependency too early.

## 7. API versioning strategy

**Decision**: URL path versioning (`/api/v1/...`).

**Rationale**:
- Cache-friendly and explicit.
- Easy to document and test.
- Works cleanly with both NestJS controllers and Next.js App Router fetch patterns.

## 8. Legacy MD5 password migration strategy

**Decision**: Rehash MD5 to bcrypt on the user's next successful login, then invalidate the old MD5 hash.

**Rationale**:
- Cannot batch-convert MD5 to bcrypt because MD5 is not reversible.
- Forcing a mass password reset would create poor UX and support load.
- Rehashing on login gradually upgrades the database while keeping MD5 hashes only until the user authenticates.

## 9. Session/result lifecycle states

**Decision**: Minimal state enum: `pending`, `in_progress`, `completed`, `abandoned`, `archived`.

**Rationale**:
- Enough states to support the test engine and migration reconciliation without introducing complexity.
- `archived` allows historical legacy rows to be marked without deletion.
- Additional states can be added later if feature specs require them.

## 10. Performance targets

**Decision**: p95 <200 ms for health checks and simple CRUD; p95 <500 ms for aggregate/report endpoints.

**Rationale**:
- Achievable with NestJS + Prisma + MySQL on the existing hardware assumptions.
- Leaves headroom for heavier test-engine queries in later features.
- Foundation phase does not require complex caching layers to meet these targets.

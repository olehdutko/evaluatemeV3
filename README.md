# EvaluateMe.IT v3.0

Clean Architecture monorepo for EvaluateMe.IT v3.0.

## Architecture

- **Frontend**: Next.js 14 App Router (`apps/web`)
- **Backend**: NestJS 10 + Prisma 5 with MySQL provider (`apps/api`)
- **Domain**: Pure TypeScript shared package (`packages/domain`)
- **Database**: Existing MySQL 5.7 `evaluateme` database; new v3 InnoDB tables created alongside legacy tables

## Project Structure

```text
apps/
  web/        # Next.js App Router frontend
  api/        # NestJS backend
packages/
  domain/     # Domain entities and repository ports (no framework imports)
  prisma/     # Prisma schema and migrations
  ts-config/  # Shared TypeScript configuration
docs/
  architecture/  # ADRs and architecture documentation
```

## Quick Start

See [`specs/001-01-architecture/quickstart.md`](specs/001-01-architecture/quickstart.md) for setup and validation steps.

## Governance

This project follows the constitution in `.specify/memory/constitution.md`.

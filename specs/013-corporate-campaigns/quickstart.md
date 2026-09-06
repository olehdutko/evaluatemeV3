# Quickstart: Corporate Campaigns Management

## What is built

A corporate portal where company administrators can:

1. Create and manage campaigns (open / closed / archived).
2. Build private company quizzes: custom (from existing questions) or personal (new questions).
3. Generate and email access codes tied to a campaign and a quiz.
4. Review candidate results scoped to a campaign with per-question correctness and a summary score.

## Local development

1. Ensure MySQL is running and `DATABASE_URL` is configured.
2. Apply the Prisma migration: `packages/prisma/migrations/20260905000000_corporate_campaigns/migration.sql`
3. Regenerate Prisma client: `npx prisma generate --schema packages/prisma/schema.prisma`
4. Start the API: `npm run dev:api`
5. Start the web app: `npm run dev:web`
6. Log in as the seeded company user and navigate to `http://localhost:4000/campaigns`.

## Seeded test account

- **Email**: `corporate.admin@example.com`
- **Password**: `CorpPassword123!`
- **Company**: EvaluateMe Demo Corp
- **Available tests**: 100
- **Available access codes**: 1000

To create more company users:

```bash
cd apps/api && npx ts-node src/scripts/create-company-user.ts "<email>" "<password>" "<company name>"
```

## Typical flow

1. **Create campaign** → `POST /api/v1/corporate/campaigns`
   ```json
   { "companyId": "...", "name": "Spring 2026 QA Hiring", "description": "...", "notes": "..." }
   ```
2. **Build a quiz** → `POST /api/v1/corporate/quizzes/custom` or `/personal`
3. **Open campaign detail** → `/campaigns/[id]?companyId=...` and create an access code:
   ```json
   { "companyId": "...", "quizId": "...", "quizType": "technology" }
   ```
4. **Email the code** → `POST /api/v1/corporate/access-codes/:id/send` with `{ "companyId": "...", "email": "..." }`
5. **Candidate completes test** using the access code at the public test entry point.
6. **View results** → `/campaigns/[id]/results?companyId=...`

## API contracts

See `specs/013-corporate-campaigns/contracts/` for request/response details.

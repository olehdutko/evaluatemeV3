# Backend Module Catalog

This document lists the 13 backend modules in EvaluateMe v3, their responsibilities,
and the P1/P2 feature assignments they own.

## Module List

| Module | Responsibility | P1 Features | P2 Features |
|--------|----------------|-------------|-------------|
| **auth** | Authentication and authorization for all user types. JWT issuance/validation for personal users and admins; session-token strategy for companies and candidates. | Login, token refresh, logout, password rehash on MD5→bcrypt migration. | OAuth integration, MFA, password reset. |
| **users** | Personal user registration, profile management, activation status, role assignment. | Registration, email activation, user profile. | Admin user management, user suspension. |
| **companies** | Company account management, credit economy, company profiles linked to `users`. | Company registration, company profile, available tests/access codes. | Credit purchases, invoices, bulk operations. |
| **campaigns** | Marketing campaigns and landing ads managed by admins/companies. | Campaign creation, status lifecycle, email templates. | Campaign analytics, A/B landing ads. |
| **technologies** | Technology catalog used to organize tests and free sample questions. | CRUD catalog, `GET /api/v1/technologies`. | Technology aliases, popularity metrics. |
| **tests** | Test definition, question/answer management, versioning. | Test CRUD, question/answer CRUD, test publishing. | Test versioning, bulk import. |
| **test-engine** | Running tests for personal users and candidates via access codes; timing, scoring, session integrity. | Start test, answer question, finish test, result generation. | Proctoring, offline resume, randomization. |
| **access-codes** | Access code lifecycle for candidates taking tests on behalf of companies. | Generate codes, revoke codes, mark used. | Bulk code generation, expiration policies. |
| **candidates** | Candidate identity, session-based test taking, result linking. | Candidate session, anonymous test taking. | Candidate history, result sharing. |
| **payments** | Orders, payment processing, refunds, credit packages. | Order creation, status tracking. | Payment provider integrations, refunds. |
| **results** | Test result storage, retrieval, certificates, analytics. | Result storage, result lookup by result code. | Certificates, scoring analytics. |
| **admin** | Admin-only operations: user management, credit settings, global configuration. | Credit settings, admin dashboard data. | Audit logs, system metrics. |
| **notifications** | Email and in-app notifications based on templates. | Email templates, campaign emails. | Push notifications, notification preferences. |

## Integration Rules

- A feature MUST belong to exactly one primary module.
- Cross-module interaction MUST happen through domain ports or explicit integration contracts.
- Circular dependencies between modules are forbidden.
- Domain layer code MUST NOT import from another module's infrastructure.

## Forbidden Patterns

- Direct Prisma/ORM usage outside `apps/api/src/infrastructure/`
- Module A's application layer importing Module B's infrastructure
- Shared “utils” that grow into a second shared kernel

## Cycle Detection

`scripts/check-module-cycles.sh` is run in CI to reject circular imports between
module directories.

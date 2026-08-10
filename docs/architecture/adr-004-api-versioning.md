# ADR-004: API Versioning Policy

## Status

Accepted

## Context

EvaluateMe v3 exposes a public REST API consumed by the Next.js frontend and potentially by third-party integrations in the future. Without a clear versioning policy, breaking changes risk breaking existing consumers.

## Decision

1. All v3 endpoints are prefixed with `/api/v1`.
2. Non-breaking additions may be added to `/api/v1` without bumping the version.
3. Breaking changes MUST be introduced under a new major path (`/api/v2/`).
4. A breaking change MUST be preceded by a deprecation period of at least one minor release.
5. Each new major version MUST have an ADR documenting the rationale and migration path.

## What Constitutes a Breaking Change

- Removing or renaming an endpoint
- Removing or renaming a request/response field
- Changing the type or meaning of an existing field
- Removing an enum value
- Changing authentication requirements for an existing endpoint

## What Is Not a Breaking Change

- Adding new optional fields to request or response payloads
- Adding new endpoints
- Adding new query parameters
- Expanding an enum with new values

## Consequences

### Positive

- Clear contract between backend and consumers
- Ability to evolve the API without breaking existing clients
- Documented migration path for major changes

### Negative

- Multiple code paths to maintain during transition periods
- More documentation overhead

## Enforcement

- All NestJS controllers use `@Controller('/api/v1/...')`.
- Integration test `api-versioning.integration.test.ts` asserts no unversioned routes.
- New major versions require an ADR.

## References

- `specs/003-03-api/api-conventions.md`
- `apps/api/tests/integration/api-versioning.integration.test.ts`

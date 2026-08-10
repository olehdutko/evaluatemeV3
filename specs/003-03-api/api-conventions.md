# API Conventions

All backend REST endpoints for EvaluateMe v3 follow the conventions in this document.
Frontend and backend teams MUST validate requests and responses against the Zod schemas
in `apps/api/src/lib/schemas/`.

## Base URL

All endpoints use URL path versioning:

```
https://api.evaluateme.it/api/v1
```

Local development:

```
http://localhost:3001/api/v1
```

## HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Retrieve a resource or list |
| `POST` | Create a new resource or execute an action |
| `PUT` | Full replacement of a resource |
| `PATCH` | Partial update of a resource |
| `DELETE` | Remove a resource |

## Content-Type

- Request bodies: `application/json`
- Response bodies: `application/json`
- File uploads: `multipart/form-data` (only where explicitly documented)

## Authentication

Two token models are used:

1. **JWT** for personal users and admins.
   - Header: `Authorization: Bearer <jwt>`
   - Cookie: `access_token` (HTTP-only, secure in production, `SameSite=Lax`)
   - Refresh token is exchanged via `POST /api/v1/auth/refresh`.
2. **Session-based token** for companies and candidates taking tests.
   - Cookie: `session_token` (HTTP-only, secure in production, `SameSite=Strict`)
   - Used for test-engine endpoints where session integrity matters.

Unauthenticated requests receive `401 Unauthorized`.
Insufficient permissions receive `403 Forbidden`.

## Response Envelope

All responses follow a consistent envelope:

### Success

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
```

For list endpoints without pagination, `meta` may be `null` or omitted.
For single-resource endpoints, `data` contains the resource object.

### Error

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": {
      "resource": "User",
      "id": "abc-123"
    }
  },
  "meta": null
}
```

## Pagination

List endpoints use offset or cursor pagination depending on use case.

### Offset Pagination

Query parameters:

- `page` — integer, default `1`
- `perPage` — integer, default `20`, max `100`

Response meta:

```json
{
  "page": 1,
  "perPage": 20,
  "total": 100
}
```

### Cursor Pagination

Used for large, append-only streams (e.g., activity logs).

Query parameters:

- `cursor` — opaque cursor string
- `limit` — integer, default `20`, max `100`

Response meta:

```json
{
  "nextCursor": "abc123",
  "hasMore": true
}
```

## Sorting

Use `sort` and `order` query parameters:

- `sort` — field name (e.g. `createdAt`, `email`)
- `order` — `asc` or `desc`, default `asc`

Multiple sort fields are comma-separated: `sort=status,-createdAt`.

## Filtering

Filters are query parameters prefixed by the field name:

```
GET /api/v1/users?role=company&status=active
GET /api/v1/campaigns?status=active&createdBy=uuid
```

Date ranges use `from`/`to` suffixes:

```
GET /api/v1/orders?createdAtFrom=2026-01-01&createdAtTo=2026-12-31
```

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `BAD_REQUEST` | 400 | Malformed request or validation failure |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource already exists or state conflict |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Validation Errors

Validation failures return `400 Bad Request` with a structured `details` block:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Request validation failed.",
    "details": {
      "email": ["Invalid email format"],
      "role": ["Role must be one of: user, company, admin"]
    }
  },
  "meta": null
}
```

## Idempotency

For operations that must be safe to retry (payments, migrations), use an `Idempotency-Key` header:

```
POST /api/v1/orders
Idempotency-Key: <uuid>
```

The server stores the key for 24 hours and returns the same response for duplicate keys with the same payload.

## Health Endpoint

```
GET /api/v1/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "ok",
    "timestamp": "2026-08-09T12:00:00Z"
  }
}
```

Expected response time: p95 <200 ms.

## Versioning Policy

- The `/api/v1/` prefix is stable for the v3 architecture foundation.
- Breaking changes require a new major version path (`/api/v2/`).
- A breaking change MUST be preceded by a deprecation period of at least one minor release.
- Non-breaking additions may be added to `/api/v1/` without version bump.
- Each version MUST have an ADR documenting the rationale and migration path.

## Security Headers

All API responses include:

- `Content-Type: application/json`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (production only)

CORS is configured to allow only known frontend origins.

## Request / Response Schema Validation

- Backend validates incoming request bodies using Zod pipes at controller boundaries.
- Frontend validates API responses using Zod before rendering.
- Contract tests in `apps/api/tests/contract/` assert both request and response shapes.

## References

- `docs/architecture/adr-004-api-versioning.md`
- `apps/api/src/lib/schemas/`
- `apps/api/tests/contract/`

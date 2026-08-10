# Development Log

## 2026-08-10 — Feature 005-05-auth

- Implemented backend JWT authentication: register, login, refresh, logout.
- Added token blacklist via `InMemoryTokenBlacklist`.
- Added session-token adapter for company/candidate flows.
- Wired `AuthController` and `AuthModule` into `AppModule`.
- Implemented frontend `/login`, `/register` pages with forms and `AuthProvider` context.
- Added Next.js middleware route guard redirecting unauthenticated users.
- Added unit tests for backend (48 passed) and frontend (22 passed).
- Auth integration tests skip when `DATABASE_URL` is unavailable.
- Committed as `9993af7 feat: 005-05-auth JWT auth, session tokens, login/register UI, route guard`.


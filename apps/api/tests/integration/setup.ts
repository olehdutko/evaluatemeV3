process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-must-be-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-must-be-at-least-32-characters';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://test:test@localhost:3307/evaluateme_test';
}

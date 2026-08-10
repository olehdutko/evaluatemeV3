import { z } from 'zod';

const appConfigSchema = z.object({
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),
  jwtSecret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  jwtRefreshSecret: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  apiPort: z.coerce.number().int().positive().default(3001),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

function loadAppConfig(): AppConfig {
  const parsed = appConfigSchema.safeParse({
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    apiPort: process.env.API_PORT,
  });

  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`Invalid application configuration:\n${messages}`);
  }

  return parsed.data;
}

let cachedConfig: AppConfig | undefined;

export function getAppConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadAppConfig();
  }
  return cachedConfig;
}

export const appConfig = getAppConfig();

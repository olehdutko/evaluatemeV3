import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env.local') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RegisterUseCase } from '../application/auth/register.use-case';

async function bootstrap(): Promise<void> {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error('Usage: ts-node create-admin.ts <email> <password>');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const registerUseCase = app.get(RegisterUseCase);

  try {
    const result = await registerUseCase.execute({
      email,
      password,
      role: 'admin',
    });
    // eslint-disable-next-line no-console
    console.log('Admin created:', result.data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create admin:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();

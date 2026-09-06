import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { appConfig } from './infrastructure/config/app-config';
import { SecurityHeadersMiddleware } from './infrastructure/security/security-headers.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const securityHeaders = new SecurityHeadersMiddleware();
  app.use((req: unknown, res: unknown, next: () => void) => securityHeaders.use(req as never, res as never, next));
  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.WEB_ORIGIN || 'http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  await app.listen(appConfig.apiPort);
}

void bootstrap();

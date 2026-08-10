import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './infrastructure/config/app-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.WEB_ORIGIN || 'http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  await app.listen(appConfig.apiPort);
}

bootstrap();

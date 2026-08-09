import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './infrastructure/config/app-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  await app.listen(appConfig.apiPort);
}

void bootstrap();

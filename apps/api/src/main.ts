import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './infrastructure/config/app-config';
import { ErrorHandler } from './infrastructure/errors/error-handler';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ErrorHandler());
  await app.listen(appConfig.apiPort);
}

void bootstrap();

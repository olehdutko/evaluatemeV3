import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export async function createTestApp(): Promise<NestExpressApplication | undefined> {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('/api/v1');
  try {
    await app.init();
    return app as unknown as NestExpressApplication;
  } catch {
    await app.close();
    return undefined;
  }
}

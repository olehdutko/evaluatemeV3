import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestEngineModule } from './modules/test-engine/test-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    TechnologiesModule,
    AuthModule,
    TestEngineModule,
  ],
})
export class AppModule {}

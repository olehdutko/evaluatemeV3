import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestEngineModule } from './modules/test-engine/test-engine.module';
import { MeModule } from './modules/me/me.module';
import { AdminModule } from './modules/admin/admin.module';
import { PublicInfoModule } from './modules/public-info/public-info.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    HealthModule,
    TechnologiesModule,
    AuthModule,
    TestEngineModule,
    MeModule,
    AdminModule,
    PublicInfoModule,
  ],
})
export class AppModule {}

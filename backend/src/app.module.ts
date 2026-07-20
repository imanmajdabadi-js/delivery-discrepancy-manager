import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateApplicationEnvironment } from './config/application.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateApplicationEnvironment,
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}

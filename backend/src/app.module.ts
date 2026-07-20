import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateApplicationEnvironment } from './config/application.config';
import { CasesModule } from './cases/cases.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateApplicationEnvironment,
    }),
    DatabaseModule,
    HealthModule,
    OrdersModule,
    CasesModule,
  ],
})
export class AppModule {}

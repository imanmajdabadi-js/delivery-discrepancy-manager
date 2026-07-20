import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface HealthResponse {
  status: 'ok';
  service: 'delivery-discrepancy-api';
  database: 'reachable';
}

@Controller('health')
export class HealthController {
  constructor(private readonly database: PrismaService) {}

  @Get()
  async getHealth(): Promise<HealthResponse> {
    await this.database.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'delivery-discrepancy-api',
      database: 'reachable',
    };
  }
}

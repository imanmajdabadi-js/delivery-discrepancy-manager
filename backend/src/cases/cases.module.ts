import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { OperatorAuthGuard } from '../auth/operator-auth.guard';

// TEMPORARY: OperatorAuthGuard is a placeholder until JWT is implemented.
// See backend/src/auth/operator-auth.guard.ts for migration notes.
// DO NOT apply this guard to additional endpoints.
@Module({
  controllers: [CasesController],
  providers: [CasesService, OperatorAuthGuard],
})
export class CasesModule {}

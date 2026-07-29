import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CurrentOperator } from '../auth/operator-auth.guard';
import { OperatorAuthGuard } from '../auth/operator-auth.guard';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(@Query('query') query?: string, @Query('status') status?: string) {
    return this.casesService.findAll(query, status);
  }

  @Get('stats')
  getStats() {
    return this.casesService.getStats();
  }

  @Get(':caseId')
  findOne(@Param('caseId') caseId: string) {
    return this.casesService.findOne(caseId);
  }

  @Post(':caseId/decision')
  decide(@Param('caseId') caseId: string, @Body() body: unknown) {
    return this.casesService.decide(caseId, body);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.casesService.create(body);
  }

  // TEMPORARY: OperatorAuthGuard is a placeholder until JWT is implemented.
  // See backend/src/auth/operator-auth.guard.ts for migration notes.
  @UseGuards(OperatorAuthGuard)
  @Post(':caseId/claim')
  claim(
    @Param('caseId') caseId: string,
    @CurrentOperator() operatorId: string,
  ) {
    return this.casesService.claimCase(caseId, operatorId);
  }

  @UseGuards(OperatorAuthGuard)
  @Post(':caseId/release')
  release(
    @Param('caseId') caseId: string,
    @CurrentOperator() operatorId: string,
  ) {
    return this.casesService.releaseCase(caseId, operatorId);
  }
}

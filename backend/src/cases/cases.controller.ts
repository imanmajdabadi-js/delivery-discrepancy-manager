import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(@Query('query') query?: string, @Query('status') status?: string) {
    return this.casesService.findAll(query, status);
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
}

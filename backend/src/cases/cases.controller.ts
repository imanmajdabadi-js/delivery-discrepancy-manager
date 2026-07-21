import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get(':caseId')
  findOne(@Param('caseId') caseId: string) {
    return this.casesService.findOne(caseId);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.casesService.create(body);
  }
}

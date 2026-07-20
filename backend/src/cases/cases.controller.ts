import { Body, Controller, Post } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.casesService.create(body);
  }
}

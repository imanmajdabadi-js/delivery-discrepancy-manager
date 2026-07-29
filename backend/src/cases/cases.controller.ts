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
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/jwt.strategy';
import { RolesGuard, Roles } from '../auth/roles.guard';

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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('MANAGER')
  @Post(':caseId/decision')
  decide(@Param('caseId') caseId: string, @Body() body: unknown) {
    return this.casesService.decide(caseId, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR')
  @Post()
  create(@Body() body: unknown) {
    return this.casesService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR')
  @Post(':caseId/claim')
  claim(
    @Param('caseId') caseId: string,
    @CurrentUser() operator: { id: string; role: string },
  ) {
    return this.casesService.claimCase(caseId, operator.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR')
  @Post(':caseId/release')
  release(
    @Param('caseId') caseId: string,
    @CurrentUser() operator: { id: string; role: string },
  ) {
    return this.casesService.releaseCase(caseId, operator.id);
  }
}

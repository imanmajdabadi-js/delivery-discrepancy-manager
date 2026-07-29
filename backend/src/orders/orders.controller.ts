import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR')
  @Get('search')
  search(@Query('query') query?: string) {
    return this.ordersService.search(query);
  }
}

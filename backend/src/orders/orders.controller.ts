import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('search')
  search(@Query('query') query?: string) {
    return this.ordersService.search(query);
  }
}

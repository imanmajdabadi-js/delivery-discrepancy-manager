import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  getOrderEligibility,
  getPhoneCandidate,
  normalizeSearchQuery,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from './order-search.helpers';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async search(rawQuery: string | undefined) {
    const query = normalizeSearchQuery(rawQuery ?? '');

    if (
      query.length < SEARCH_QUERY_MIN_LENGTH ||
      query.length > SEARCH_QUERY_MAX_LENGTH
    ) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_SEARCH_QUERY',
        message: 'عبارت جست‌وجو باید بین ۳ تا ۶۴ نویسه باشد.',
      });
    }

    const searchConditions: Prisma.OrderWhereInput[] = [
      { orderNumber: { equals: query, mode: 'insensitive' } },
      {
        customer: {
          is: { customerCode: { equals: query, mode: 'insensitive' } },
        },
      },
    ];
    const phoneCandidate = getPhoneCandidate(query);

    if (phoneCandidate) {
      searchConditions.push({
        customer: { is: { phone: { equals: phoneCandidate } } },
      });
    }

    const orders = await this.prisma.order.findMany({
      where: { OR: searchConditions },
      include: {
        customer: true,
        items: {
          where: { deliveredQuantity: { gt: 0 } },
          orderBy: { productName: 'asc' },
        },
      },
      orderBy: [{ deliveredAt: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      query,
      results: orders.map((order) => {
        const eligibility = getOrderEligibility(
          order.status,
          order.items.length,
        );

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          deliveredAt: order.deliveredAt?.toISOString() ?? null,
          customer: {
            id: order.customer.id,
            customerCode: order.customer.customerCode,
            fullName: order.customer.fullName,
            phone: order.customer.phone,
          },
          items: eligibility.eligible
            ? order.items.map((item) => ({
                id: item.id,
                sku: item.sku,
                productName: item.productName,
                unit: item.unit,
                deliveredQuantity: item.deliveredQuantity,
              }))
            : [],
          eligibility,
        };
      }),
    };
  }
}

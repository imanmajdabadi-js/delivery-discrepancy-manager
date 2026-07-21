import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CaseEventType,
  CaseStatus,
  DiscrepancyType,
  OrderStatus,
  Prisma,
} from '../generated/prisma/client';
import {
  parseCreateCaseInput,
  validateCaseItemsAgainstOrder,
  type CreateCaseInput,
  isUuid,
} from './case-validation.helpers';

const developmentOperatorEmail = 'operator@local.test';

interface OpenConflict {
  orderItemId: string;
  type: DiscrepancyType;
  case: { caseNumber: string };
}

function isPrismaErrorWithCode(error: unknown, codes: string[]) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    codes.includes(error.code)
  );
}

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(caseId: string) {
    if (!isUuid(caseId)) {
      this.throwCaseNotFound();
    }

    const caseDetails = await this.prisma.discrepancyCase.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        caseNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveredAt: true,
            customer: {
              select: {
                id: true,
                customerCode: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        items: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            type: true,
            quantity: true,
            orderItem: {
              select: {
                id: true,
                sku: true,
                productName: true,
                unit: true,
                deliveredQuantity: true,
              },
            },
          },
        },
        decision: {
          select: {
            type: true,
            explanation: true,
            createdAt: true,
            decidedBy: {
              select: { id: true, fullName: true },
            },
          },
        },
        history: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            eventType: true,
            resultingStatus: true,
            createdAt: true,
            performedBy: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    if (!caseDetails) {
      this.throwCaseNotFound();
    }

    return {
      ...caseDetails,
      createdAt: caseDetails.createdAt.toISOString(),
      updatedAt: caseDetails.updatedAt.toISOString(),
      order: {
        ...caseDetails.order,
        deliveredAt: caseDetails.order.deliveredAt?.toISOString() ?? null,
      },
      decision: caseDetails.decision
        ? {
            ...caseDetails.decision,
            createdAt: caseDetails.decision.createdAt.toISOString(),
          }
        : null,
      history: caseDetails.history.map((event) => ({
        ...event,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }

  async create(rawInput: unknown) {
    const parsedInput = parseCreateCaseInput(rawInput);

    if (!parsedInput.value) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_CASE_INPUT',
        message: 'اطلاعات پرونده را بررسی کنید.',
        errors: parsedInput.issues,
      });
    }

    const input = parsedInput.value;

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const [order, operator] = await Promise.all([
            transaction.order.findUnique({
              where: { id: input.orderId },
              include: { items: true },
            }),
            transaction.operator.findUnique({
              where: { email: developmentOperatorEmail },
              select: { id: true },
            }),
          ]);

          if (!order) {
            throw new NotFoundException({
              statusCode: 404,
              code: 'ORDER_NOT_FOUND',
              message: 'سفارش انتخاب‌شده دیگر وجود ندارد.',
            });
          }

          if (order.status !== OrderStatus.DELIVERED) {
            throw new UnprocessableEntityException({
              statusCode: 422,
              code: 'ORDER_NOT_ELIGIBLE',
              reason: 'NOT_DELIVERED',
              message: 'تحویل سفارش انتخاب‌شده نهایی نشده است.',
            });
          }

          if (order.items.length === 0) {
            throw new UnprocessableEntityException({
              statusCode: 422,
              code: 'ORDER_NOT_ELIGIBLE',
              reason: 'NO_ITEMS',
              message: 'سفارش انتخاب‌شده قلم تحویل‌شده‌ای ندارد.',
            });
          }

          if (!operator) {
            throw new InternalServerErrorException({
              statusCode: 500,
              code: 'DEVELOPMENT_OPERATOR_MISSING',
              message: 'کاربر عملیاتی محیط توسعه پیدا نشد.',
            });
          }

          const validationIssues = validateCaseItemsAgainstOrder(
            input.items,
            order.items,
          );

          if (validationIssues.length > 0) {
            throw new BadRequestException({
              statusCode: 400,
              code: 'INVALID_CASE_ITEMS',
              message: 'مقدار اقلام انتخاب‌شده را بررسی کنید.',
              errors: validationIssues,
            });
          }

          const conflicts = await transaction.openDiscrepancy.findMany({
            where: { OR: this.buildConflictConditions(input) },
            include: { case: { select: { caseNumber: true } } },
          });

          if (conflicts.length > 0) {
            this.throwOpenConflict(conflicts);
          }

          const sequenceRows = await transaction.$queryRaw<
            Array<{ value: bigint }>
          >(Prisma.sql`
            SELECT nextval('discrepancy_case_number_seq') AS value
          `);
          const sequenceValue = sequenceRows[0]?.value;

          if (sequenceValue === undefined) {
            throw new InternalServerErrorException({
              statusCode: 500,
              code: 'CASE_NUMBER_GENERATION_FAILED',
              message: 'شماره پرونده ساخته نشد.',
            });
          }

          const caseNumber = `CASE-${sequenceValue.toString().padStart(6, '0')}`;
          const createdCase = await transaction.discrepancyCase.create({
            data: {
              caseNumber,
              orderId: order.id,
              createdById: operator.id,
              items: {
                create: input.items.map((item) => ({
                  orderItemId: item.orderItemId,
                  type: item.type,
                  quantity: item.quantity,
                })),
              },
              openDiscrepancies: {
                create: input.items.map((item) => ({
                  orderItemId: item.orderItemId,
                  type: item.type,
                })),
              },
              history: {
                create: {
                  eventType: CaseEventType.CREATED,
                  resultingStatus: CaseStatus.SUBMITTED,
                  performedById: operator.id,
                },
              },
            },
            select: {
              id: true,
              caseNumber: true,
              status: true,
              createdAt: true,
            },
          });

          return {
            ...createdCase,
            createdAt: createdCase.createdAt.toISOString(),
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (isPrismaErrorWithCode(error, ['P2002', 'P2034'])) {
        const conflicts = await this.prisma.openDiscrepancy.findMany({
          where: { OR: this.buildConflictConditions(input) },
          include: { case: { select: { caseNumber: true } } },
        });

        if (conflicts.length > 0) {
          this.throwOpenConflict(conflicts);
        }

        throw new ConflictException({
          statusCode: 409,
          code: 'CASE_CREATION_CONFLICT',
          message:
            'اطلاعات هم‌زمان تغییر کرده است. سفارش را دوباره بررسی و ثبت کنید.',
        });
      }

      throw error;
    }
  }

  private buildConflictConditions(input: CreateCaseInput) {
    return input.items.map((item) => ({
      orderItemId: item.orderItemId,
      type: item.type,
    }));
  }

  private throwCaseNotFound(): never {
    throw new NotFoundException({
      statusCode: 404,
      code: 'CASE_NOT_FOUND',
      message: 'پرونده موردنظر پیدا نشد.',
    });
  }

  private throwOpenConflict(conflicts: OpenConflict[]): never {
    throw new ConflictException({
      statusCode: 409,
      code: 'OPEN_DISCREPANCY_CONFLICT',
      message: 'برای بخشی از اقلام انتخاب‌شده پرونده باز وجود دارد.',
      conflicts: conflicts.map((conflict) => ({
        orderItemId: conflict.orderItemId,
        type: conflict.type,
        caseNumber: conflict.case.caseNumber,
      })),
    });
  }
}

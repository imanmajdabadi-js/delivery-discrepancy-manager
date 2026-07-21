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
  DecisionType,
  DiscrepancyType,
  OrderStatus,
  Prisma,
} from '../generated/prisma/client';
import {
  CASE_LIST_QUERY_MAX_LENGTH,
  isCaseStatus,
  normalizeCaseListQuery,
} from './case-list.helpers';
import { parseCaseDecisionInput } from './case-decision.helpers';
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

  async findAll(rawQuery: string | undefined, rawStatus: string | undefined) {
    const query = normalizeCaseListQuery(rawQuery ?? '');
    const normalizedStatus = rawStatus?.trim().toUpperCase() ?? '';

    if (query.length > CASE_LIST_QUERY_MAX_LENGTH) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_CASE_LIST_QUERY',
        message: 'عبارت جست‌وجو نمی‌تواند بیشتر از ۶۴ نویسه باشد.',
      });
    }

    let status: CaseStatus | null = null;

    if (normalizedStatus) {
      if (!isCaseStatus(normalizedStatus)) {
        throw new BadRequestException({
          statusCode: 400,
          code: 'INVALID_CASE_STATUS',
          message: 'وضعیت انتخاب‌شده معتبر نیست.',
        });
      }

      status = normalizedStatus;
    }

    const cases = await this.prisma.discrepancyCase.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(query
          ? {
              OR: [
                { caseNumber: { contains: query, mode: 'insensitive' } },
                {
                  order: {
                    is: {
                      orderNumber: { contains: query, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        caseNumber: true,
        status: true,
        createdAt: true,
        order: {
          select: {
            orderNumber: true,
            customer: { select: { fullName: true } },
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return {
      query,
      status,
      results: cases.map((caseItem) => ({
        id: caseItem.id,
        caseNumber: caseItem.caseNumber,
        status: caseItem.status,
        createdAt: caseItem.createdAt.toISOString(),
        orderNumber: caseItem.order.orderNumber,
        customerName: caseItem.order.customer.fullName,
        itemCount: caseItem._count.items,
      })),
    };
  }

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

  async decide(caseId: string, rawInput: unknown) {
    if (!isUuid(caseId)) {
      this.throwCaseNotFound();
    }

    const parsedInput = parseCaseDecisionInput(rawInput);

    if (!parsedInput.value) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_CASE_DECISION',
        message: 'اطلاعات تصمیم را بررسی کنید.',
        errors: parsedInput.issues,
      });
    }

    const input = parsedInput.value;
    const resultingStatus =
      input.type === DecisionType.APPROVE
        ? CaseStatus.APPROVED
        : CaseStatus.REJECTED;

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const caseSnapshot = await transaction.discrepancyCase.findUnique({
            where: { id: caseId },
            select: { id: true, caseNumber: true, status: true },
          });

          if (!caseSnapshot) {
            this.throwCaseNotFound();
          }

          if (caseSnapshot.status !== CaseStatus.SUBMITTED) {
            this.throwCaseAlreadyDecided(
              caseSnapshot.caseNumber,
              caseSnapshot.status,
            );
          }

          const operator = await transaction.operator.findUnique({
            where: { email: developmentOperatorEmail },
            select: { id: true, fullName: true },
          });

          if (!operator) {
            throw new InternalServerErrorException({
              statusCode: 500,
              code: 'DEVELOPMENT_OPERATOR_MISSING',
              message: 'کاربر عملیاتی محیط توسعه پیدا نشد.',
            });
          }

          const updateResult = await transaction.discrepancyCase.updateMany({
            where: { id: caseId, status: CaseStatus.SUBMITTED },
            data: { status: resultingStatus },
          });

          if (updateResult.count !== 1) {
            this.throwDecisionConflict();
          }

          const decision = await transaction.caseDecision.create({
            data: {
              caseId,
              type: input.type,
              explanation: input.explanation,
              decidedById: operator.id,
            },
            select: {
              type: true,
              explanation: true,
              createdAt: true,
              decidedBy: { select: { id: true, fullName: true } },
            },
          });

          await transaction.openDiscrepancy.deleteMany({ where: { caseId } });

          await transaction.caseHistory.create({
            data: {
              caseId,
              eventType: CaseEventType.DECIDED,
              resultingStatus,
              performedById: operator.id,
            },
          });

          return {
            id: caseSnapshot.id,
            caseNumber: caseSnapshot.caseNumber,
            status: resultingStatus,
            decision: {
              ...decision,
              createdAt: decision.createdAt.toISOString(),
            },
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (isPrismaErrorWithCode(error, ['P2002', 'P2034'])) {
        const currentCase = await this.prisma.discrepancyCase.findUnique({
          where: { id: caseId },
          select: { caseNumber: true, status: true },
        });

        if (!currentCase) {
          this.throwCaseNotFound();
        }

        if (currentCase.status !== CaseStatus.SUBMITTED) {
          this.throwCaseAlreadyDecided(
            currentCase.caseNumber,
            currentCase.status,
          );
        }

        this.throwDecisionConflict();
      }

      throw error;
    }
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

  private throwCaseAlreadyDecided(
    caseNumber: string,
    currentStatus: CaseStatus,
  ): never {
    throw new ConflictException({
      statusCode: 409,
      code: 'CASE_ALREADY_DECIDED',
      message: 'این پرونده قبلاً نهایی شده و امکان ثبت تصمیم دیگری ندارد.',
      caseNumber,
      currentStatus,
    });
  }

  private throwDecisionConflict(): never {
    throw new ConflictException({
      statusCode: 409,
      code: 'CASE_DECISION_CONFLICT',
      message:
        'وضعیت پرونده هم‌زمان تغییر کرده است. اطلاعات را دوباره بررسی کنید.',
    });
  }
}

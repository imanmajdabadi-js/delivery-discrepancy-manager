/**
 * TEMPORARY AUTHENTICATION BRIDGE
 *
 * This guard is NOT real authentication. It exists only to expose the
 * assignment endpoints until JWT authentication is implemented.
 *
 * Security limitations:
 * - Operator identity is provided via an unauthenticated HTTP header.
 * - There is no token, session, or cryptographic proof of identity.
 * - Any client that knows a valid operator UUID can act as that operator.
 *
 * Migration path to JWT:
 * 1. Replace this file with a JWT strategy (e.g. @nestjs/jwt PassportStrategy).
 * 2. Replace @UseGuards(OperatorAuthGuard) with @UseGuards(JwtAuthGuard).
 * 3. Replace @CurrentOperator() with @CurrentUser() or equivalent.
 * 4. Remove this file and its provider registration from CasesModule.
 *
 * DO NOT expand this pattern to additional endpoints.
 */

import { Injectable, UnauthorizedException, CanActivate, ExecutionContext, createParamDecorator } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class OperatorAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const operatorId = request.headers['x-operator-id'];

    if (typeof operatorId !== 'string' || !uuidPattern.test(operatorId)) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'INVALID_OPERATOR_ID',
        message: 'شناسه اپراتور معتبر نیست.',
      });
    }

    const operator = await this.prisma.operator.findUnique({
      where: { id: operatorId },
      select: { id: true },
    });

    if (!operator) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'OPERATOR_NOT_FOUND',
        message: 'اپراتور پیدا نشد.',
      });
    }

    request.operatorId = operator.id;
    return true;
  }
}

/**
 * TEMPORARY: Extracts the operator ID attached by OperatorAuthGuard.
 *
 * Replace with a JWT-backed decorator (e.g. @CurrentUser('sub')) when
 * real authentication is implemented.
 */
export const CurrentOperator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.operatorId;
  },
);

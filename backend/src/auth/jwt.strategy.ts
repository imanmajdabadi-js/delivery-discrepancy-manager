import { Injectable, UnauthorizedException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: string; role: string }) {
    const operator = await this.prisma.operator.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!operator) {
      throw new UnauthorizedException('Invalid token.');
    }

    return { id: operator.id, role: operator.role };
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { id: string; role: string } =>
    ctx.switchToHttp().getRequest().user,
);

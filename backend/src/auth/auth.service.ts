import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(dto: { email: string; password: string; fullName: string }) {
    const existing = await this.prisma.operator.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('این ایمیل قبلاً ثبت‌نام کرده است.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const p = dto.password || '';
    const buf = crypto.scryptSync(p, salt as any, 64);
    const passwordHash = `${salt}:${buf.toString('hex')}`;

    const operator = await this.prisma.operator.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
      },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });

    return {
      message: 'ثبت‌نام با موفقیت انجام شد.',
      access_token: this.signToken(operator.id),
      operator,
    };
  }

  async login(dto: { email: string; password: string }) {
    const operator = await this.prisma.operator.findUnique({ where: { email: dto.email } });
    if (!operator || !operator.passwordHash) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    const [salt, key] = operator.passwordHash.split(':');
    const p = dto.password || '';
    const buf = crypto.scryptSync(p, salt as any, 64);

    if (buf.toString('hex') !== key) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    return {
      message: 'ورود موفقیت‌آمیز بود.',
      access_token: this.signToken(operator.id),
      operator: { id: operator.id, email: operator.email, fullName: operator.fullName },
    };
  }

  private signToken(operatorId: string): string {
    return this.jwtService.sign({ sub: operatorId });
  }
}

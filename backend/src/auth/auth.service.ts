import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: { email: string; password: string; fullName: string }) {
    const existing = await this.prisma.operator.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('این ایمیل قبلاً ثبت‌نام کرده است.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const buf = (await scrypt(dto.password, salt, 64)) as Buffer;
    const passwordHash = `${salt}:${buf.toString('hex')}`;

    const operator = await this.prisma.operator.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
      },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });

    return { message: 'ثبت‌نام با موفقیت انجام شد.', operator };
  }

  async login(dto: { email: string; password: string }) {
    const operator = await this.prisma.operator.findUnique({ where: { email: dto.email } });
    if (!operator || !operator.passwordHash) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    const [salt, key] = operator.passwordHash.split(':');
    const buf = (await scrypt(dto.password, salt, 64)) as Buffer;

    if (buf.toString('hex') !== key) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    return {
      message: 'ورود موفقیت‌آمیز بود.',
      operator: { id: operator.id, email: operator.email, fullName: operator.fullName },
    };
  }
}

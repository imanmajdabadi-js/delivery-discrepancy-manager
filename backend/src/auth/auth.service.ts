import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidatedLoginInput {
  email: string;
  password: string;
}

function validateLoginInput(body: unknown): ValidatedLoginInput {
  if (!isRecord(body)) {
    throw new BadRequestException('اطلاعات ورود معتبر نیست.');
  }

  const { email, password } = body;

  if (!isNonEmptyString(email)) {
    throw new BadRequestException('ایمیل الزامی است.');
  }

  if (!emailPattern.test(email.trim())) {
    throw new BadRequestException('فرمت ایمیل معتبر نیست.');
  }

  if (!isNonEmptyString(password)) {
    throw new BadRequestException('رمز عبور الزامی است.');
  }

  if (password.length < 8 || password.length > 72) {
    throw new BadRequestException('رمز عبور باید بین ۸ تا ۷۲ نویسه باشد.');
  }

  return { email: email.trim(), password };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(body: unknown) {
    const dto = validateLoginInput(body);

    const operator = await this.prisma.operator.findUnique({
      where: { email: dto.email },
    });
    if (!operator || !operator.passwordHash) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    const [salt, key] = operator.passwordHash.split(':');

    if (!salt || !key) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    const derivedKey = crypto.scryptSync(dto.password, salt, 64);
    const storedKey = Buffer.from(key, 'hex');
    const isPasswordValid =
      storedKey.length === derivedKey.length &&
      crypto.timingSafeEqual(storedKey, derivedKey);

    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    }

    return {
      message: 'ورود موفقیت‌آمیز بود.',
      access_token: this.signToken(operator.id, operator.role),
      operator: {
        id: operator.id,
        email: operator.email,
        fullName: operator.fullName,
      },
    };
  }

  private signToken(operatorId: string, role: string): string {
    return this.jwtService.sign({ sub: operatorId, role });
  }
}

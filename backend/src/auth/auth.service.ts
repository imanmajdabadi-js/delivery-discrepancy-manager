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

interface ValidatedRegisterInput extends ValidatedLoginInput {
  fullName: string;
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

  return { email: email.trim(), password };
}

function validateRegisterInput(body: unknown): ValidatedRegisterInput {
  const base = validateLoginInput(body);

  if (!isRecord(body)) {
    throw new BadRequestException('اطلاعات ورود معتبر نیست.');
  }

  const { fullName } = body;

  if (!isNonEmptyString(fullName)) {
    throw new BadRequestException('نام کامل الزامی است.');
  }

  return { ...base, fullName: fullName.trim() };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: unknown) {
    const dto = validateRegisterInput(body);

    const existing = await this.prisma.operator.findUnique({
      where: { email: dto.email },
    });
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
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'ثبت‌نام با موفقیت انجام شد.',
      access_token: this.signToken(operator.id, operator.role),
      operator,
    };
  }

  async login(body: unknown) {
    const dto = validateLoginInput(body);

    const operator = await this.prisma.operator.findUnique({
      where: { email: dto.email },
    });
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

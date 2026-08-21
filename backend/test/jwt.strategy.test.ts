import { UnauthorizedException } from '@nestjs/common';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { JwtStrategy } from '../src/auth/jwt.strategy';

describe('JwtStrategy', () => {
  it('returns operator with database role when valid payload is provided', async () => {
    const mockPrisma = {
      operator: {
        findUnique: async (opts: any) => ({
          id: 'operator-1',
          role: 'OPERATOR',
        }),
      },
    };

    const mockConfigService = {
      getOrThrow: () => 'test-secret',
    };

    const strategy = new JwtStrategy(
      mockPrisma as any,
      mockConfigService as any,
    );

    const result = await strategy.validate({
      sub: 'operator-1',
      role: 'OPERATOR',
    });

    assert.deepEqual(result, { id: 'operator-1', role: 'OPERATOR' });
  });

  it('uses database role over JWT role when they differ', async () => {
    const mockPrisma = {
      operator: {
        findUnique: async (opts: any) => ({
          id: 'operator-1',
          role: 'MANAGER',
        }),
      },
    };

    const mockConfigService = {
      getOrThrow: () => 'test-secret',
    };

    const strategy = new JwtStrategy(
      mockPrisma as any,
      mockConfigService as any,
    );

    const result = await strategy.validate({
      sub: 'operator-1',
      role: 'OPERATOR',
    });

    assert.equal(result.role, 'MANAGER');
  });

  it('throws UnauthorizedException when operator does not exist', async () => {
    const mockPrisma = {
      operator: {
        findUnique: async (opts: any) => null,
      },
    };

    const mockConfigService = {
      getOrThrow: () => 'test-secret',
    };

    const strategy = new JwtStrategy(
      mockPrisma as any,
      mockConfigService as any,
    );

    try {
      await strategy.validate({ sub: 'nonexistent-id', role: 'OPERATOR' });
      assert.fail('Expected UnauthorizedException to be thrown');
    } catch (err: any) {
      assert(err instanceof UnauthorizedException);
      assert(err.message.includes('Invalid token'));
    }
  });

  it('correctly passes operator ID to Prisma query', async () => {
    let queriedId = '';

    const mockPrisma = {
      operator: {
        findUnique: async (opts: any) => {
          queriedId = opts.where.id;
          return { id: 'operator-1', role: 'OPERATOR' };
        },
      },
    };

    const mockConfigService = {
      getOrThrow: () => 'test-secret',
    };

    const strategy = new JwtStrategy(
      mockPrisma as any,
      mockConfigService as any,
    );

    await strategy.validate({ sub: 'correct-id', role: 'OPERATOR' });
    assert.equal(queriedId, 'correct-id');
  });
});

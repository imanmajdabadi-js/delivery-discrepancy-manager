import { ForbiddenException } from '@nestjs/common';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ROLES_KEY, RolesGuard } from '../src/auth/roles.guard';

describe('RolesGuard', () => {
  const mockReflector = {
    getAllAndOverride: (key: string, targets: any[]) => {
      const metadata = Reflect.getOwnMetadata(key, targets[0]);
      return metadata || null;
    },
  };

  const guard = new RolesGuard(mockReflector as any);

  it('allows access when no role metadata is defined', () => {
    const context = {
      getHandler: () => function testHandler() {},
      getClass: () =>
        class TestClass {
          testHandler() {}
        },
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1', role: 'OPERATOR' },
        }),
      }),
    };

    Reflect.deleteMetadata(ROLES_KEY, context.getHandler());

    const result = guard.canActivate(context as any);
    assert.equal(result, true);
  });

  it('allows MANAGER to access MANAGER-only endpoint', () => {
    const handler = function decideHandler() {};
    Reflect.defineMetadata(ROLES_KEY, ['MANAGER'], handler);

    const context = {
      getHandler: () => handler,
      getClass: () =>
        class TestClass {
          decideHandler() {}
        },
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1', role: 'MANAGER' },
        }),
      }),
    };

    const result = guard.canActivate(context as any);
    assert.equal(result, true);
  });

  it('denies OPERATOR accessing MANAGER-only endpoint', () => {
    const handler = function decideHandler() {};
    Reflect.defineMetadata(ROLES_KEY, ['MANAGER'], handler);

    const context = {
      getHandler: () => handler,
      getClass: () =>
        class TestClass {
          decideHandler() {}
        },
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1', role: 'OPERATOR' },
        }),
      }),
    };

    assert.throws(
      () => guard.canActivate(context as any),
      (err: any) =>
        err instanceof ForbiddenException &&
        err.message.includes('دسترسی لازم'),
    );
  });

  it('denies access when user has no role', () => {
    const handler = function decideHandler() {};
    Reflect.defineMetadata(ROLES_KEY, ['MANAGER'], handler);

    const context = {
      getHandler: () => handler,
      getClass: () =>
        class TestClass {
          decideHandler() {}
        },
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1' },
        }),
      }),
    };

    assert.throws(
      () => guard.canActivate(context as any),
      (err: any) => err instanceof ForbiddenException,
    );
  });

  it('denies access when request.user is missing', () => {
    const handler = function decideHandler() {};
    Reflect.defineMetadata(ROLES_KEY, ['MANAGER'], handler);

    const context = {
      getHandler: () => handler,
      getClass: () =>
        class TestClass {
          decideHandler() {}
        },
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    };

    assert.throws(
      () => guard.canActivate(context as any),
      (err: any) => err instanceof ForbiddenException,
    );
  });

  it('denies unknown role ADMIN accessing MANAGER-only endpoint', () => {
    const handler = function decideHandler() {};
    Reflect.defineMetadata(ROLES_KEY, ['MANAGER'], handler);

    const context = {
      getHandler: () => handler,
      getClass: () =>
        class TestClass {
          decideHandler() {}
        },
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1', role: 'ADMIN' },
        }),
      }),
    };

    assert.throws(
      () => guard.canActivate(context as any),
      (err: any) => err instanceof ForbiddenException,
    );
  });
});

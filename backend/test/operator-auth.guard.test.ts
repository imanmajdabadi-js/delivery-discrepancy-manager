import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OperatorAuthGuard } from '../src/auth/operator-auth.guard';

describe('operator auth guard', () => {
  it('rejects a missing operator id header', async () => {
    const guard = createGuard({
      operator: { findUnique: async () => null },
    });

    const context = createContext({}) as any;

    await assert.rejects(
      () => guard.canActivate(context),
      (error: any) => {
        assert.equal(error.status, 401);
        assert.equal(error.response?.code, 'INVALID_OPERATOR_ID');
        return true;
      },
    );
  });

  it('rejects an invalid uuid format in the header', async () => {
    const guard = createGuard({
      operator: { findUnique: async () => null },
    });

    const context = createContext({ 'x-operator-id': 'not-a-uuid' }) as any;

    await assert.rejects(
      () => guard.canActivate(context),
      (error: any) => {
        assert.equal(error.status, 401);
        assert.equal(error.response?.code, 'INVALID_OPERATOR_ID');
        return true;
      },
    );
  });

  it('rejects a well-formed uuid that does not match an existing operator', async () => {
    const guard = createGuard({
      operator: { findUnique: async () => null },
    });

    const context = createContext({
      'x-operator-id': '123e4567-e89b-12d3-a456-426614174000',
    }) as any;

    await assert.rejects(
      () => guard.canActivate(context),
      (error: any) => {
        assert.equal(error.status, 401);
        assert.equal(error.response?.code, 'OPERATOR_NOT_FOUND');
        return true;
      },
    );
  });

  it('attaches a valid operator to the request and allows access', async () => {
    const guard = createGuard({
      operator: {
        findUnique: async () => ({
          id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      },
    });

    const request: any = {
      headers: { 'x-operator-id': '123e4567-e89b-12d3-a456-426614174000' },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    const result = await guard.canActivate(context);

    assert.equal(result, true);
    assert.equal(request.operatorId, '123e4567-e89b-12d3-a456-426614174000');
  });
});

function createGuard(mockPrisma: any) {
  return new OperatorAuthGuard(mockPrisma);
}

function createContext(headers: Record<string, any>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  };
}

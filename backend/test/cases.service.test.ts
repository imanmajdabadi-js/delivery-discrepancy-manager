import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CasesService } from '../src/cases/cases.service';
import { CaseEventType, CaseStatus } from '../src/generated/prisma/client';

function createServiceWithMockPrisma(mockPrisma: any) {
  return new CasesService(mockPrisma);
}

describe('cases service assignment workflow', () => {
  it('claims an unassigned submitted case and stores the assignee and timestamp', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';
    const caseRecord = {
      id: caseId,
      caseNumber: 'CASE-000001',
      status: CaseStatus.SUBMITTED,
      assigneeId: null,
      assignedAt: null,
    };

    const mockPrisma = {
      discrepancyCase: {
        findUnique: async () => caseRecord,
        updateMany: async () => ({ count: 1 }),
      },
      operator: {
        findUnique: async ({ where }: any) => ({ id: where.id }),
      },
      caseHistory: {
        create: async (data: any) => {
          history.push(data.data);
          return data.data;
        },
      },
      $transaction: async (_fn: any) => _fn(mockPrisma),
    };

    const service = createServiceWithMockPrisma(mockPrisma);
    const result = await service.claimCase(caseId, operatorId);

    assert.equal(result.caseNumber, 'CASE-000001');
    assert.equal(result.assigneeId, operatorId);
    assert.ok(result.assignedAt);
    assert.equal(history.length, 1);
    assert.equal(history[0]?.caseId, caseId);
    assert.equal(history[0]?.eventType, CaseEventType.ASSIGNED);
    assert.equal(history[0]?.resultingStatus, CaseStatus.SUBMITTED);
    assert.equal(history[0]?.performedById, operatorId);
  });

  it('rejects a stale claim when the case is still unassigned', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';
    let updateManyCalls = 0;
    let updateCalls = 0;

    const mockPrisma = {
      discrepancyCase: {
        findUnique: async () => ({
          id: caseId,
          caseNumber: 'CASE-000001',
          status: CaseStatus.SUBMITTED,
          assigneeId: null,
          assignedAt: null,
        }),
        updateMany: async () => {
          updateManyCalls += 1;
          return { count: 0 };
        },
        update: async () => {
          updateCalls += 1;
          return {};
        },
      },
      operator: {
        findUnique: async ({ where }: any) => ({ id: where.id }),
      },
      caseHistory: {
        create: async (data: any) => {
          history.push(data.data);
          return data.data;
        },
      },
      $transaction: async (_fn: any) => _fn(mockPrisma),
    };

    const service = createServiceWithMockPrisma(mockPrisma);

    await assert.rejects(
      () => service.claimCase(caseId, operatorId),
      (error: any) => {
        assert.equal(error.status, 409);
        assert.equal(error.response?.code, 'CASE_ASSIGNMENT_CONFLICT');
        return true;
      },
    );

    assert.equal(updateManyCalls, 1);
    assert.equal(updateCalls, 0);
    assert.equal(history.length, 0);
  });

  it('rejects claiming an already assigned case with a domain conflict', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';
    const caseRecord = {
      id: caseId,
      caseNumber: 'CASE-000001',
      status: CaseStatus.SUBMITTED,
      assigneeId: '123e4567-e89b-12d3-a456-426614174002',
      assignedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    let updateManyCalls = 0;
    const mockPrisma = {
      discrepancyCase: {
        findUnique: async () => caseRecord,
        updateMany: async () => {
          updateManyCalls += 1;
          return { count: 0 };
        },
      },
      operator: {
        findUnique: async ({ where }: any) => ({ id: where.id }),
      },
      caseHistory: {
        create: async (data: any) => {
          history.push(data.data);
          return data.data;
        },
      },
      $transaction: async (_fn: any) => _fn(mockPrisma),
    };

    const service = createServiceWithMockPrisma(mockPrisma);

    await assert.rejects(
      () => service.claimCase(caseId, operatorId),
      (error: any) => {
        assert.equal(error.status, 409);
        assert.equal(error.response?.code, 'CASE_ALREADY_ASSIGNED');
        return true;
      },
    );

    assert.equal(updateManyCalls, 0);
    assert.equal(history.length, 0);
  });

  it('rejects claiming a terminal case', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';

    for (const status of [CaseStatus.APPROVED, CaseStatus.REJECTED] as const) {
      let updateManyCalls = 0;
      const mockPrisma = {
        discrepancyCase: {
          findUnique: async () => ({
            id: caseId,
            caseNumber: 'CASE-000001',
            status,
            assigneeId: null,
            assignedAt: null,
          }),
          updateMany: async () => {
            updateManyCalls += 1;
            return { count: 1 };
          },
        },
        operator: {
          findUnique: async ({ where }: any) => ({ id: where.id }),
        },
        caseHistory: {
          create: async (data: any) => {
            history.push(data.data);
            return data.data;
          },
        },
        $transaction: async (_fn: any) => _fn(mockPrisma),
      };

      const service = createServiceWithMockPrisma(mockPrisma);

      await assert.rejects(
        () => service.claimCase(caseId, operatorId),
        (error: any) => {
          assert.equal(error.status, 409);
          assert.equal(error.response?.code, 'CASE_ALREADY_DECIDED');
          return true;
        },
      );

      assert.equal(updateManyCalls, 0);
      assert.equal(history.length, 0);
    }
  });

  it('releases an assigned submitted case and clears assignment fields', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';
    const caseRecord = {
      id: caseId,
      caseNumber: 'CASE-000001',
      status: CaseStatus.SUBMITTED,
      assigneeId: operatorId,
      assignedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const mockPrisma = {
      discrepancyCase: {
        findUnique: async () => caseRecord,
        updateMany: async () => ({ count: 1 }),
      },
      caseHistory: {
        create: async (data: any) => {
          history.push(data.data);
          return data.data;
        },
      },
      $transaction: async (_fn: any) => _fn(mockPrisma),
    };

    const service = createServiceWithMockPrisma(mockPrisma);
    const result = await service.releaseCase(caseId, operatorId);

    assert.equal(result.assigneeId, null);
    assert.equal(result.assignedAt, null);
    assert.equal(history.length, 1);
    assert.equal(history[0]?.caseId, caseId);
    assert.equal(history[0]?.eventType, CaseEventType.ASSIGNMENT_RELEASED);
    assert.equal(history[0]?.resultingStatus, CaseStatus.SUBMITTED);
    assert.equal(history[0]?.performedById, operatorId);
  });

  it('rejects releasing a case assigned to another operator', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';
    let updateManyCalls = 0;

    const mockPrisma = {
      discrepancyCase: {
        findUnique: async () => ({
          id: caseId,
          caseNumber: 'CASE-000001',
          status: CaseStatus.SUBMITTED,
          assigneeId: '123e4567-e89b-12d3-a456-426614174002',
          assignedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        updateMany: async () => {
          updateManyCalls += 1;
          return { count: 0 };
        },
      },
      caseHistory: {
        create: async (data: any) => {
          history.push(data.data);
          return data.data;
        },
      },
      $transaction: async (_fn: any) => _fn(mockPrisma),
    };

    const service = createServiceWithMockPrisma(mockPrisma);

    await assert.rejects(
      () => service.releaseCase(caseId, operatorId),
      (error: any) => {
        assert.equal(error.status, 409);
        assert.equal(error.response?.code, 'CASE_ASSIGNMENT_CONFLICT');
        return true;
      },
    );

    assert.equal(updateManyCalls, 0);
    assert.equal(history.length, 0);
  });

  it('rejects releasing an unassigned case', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';
    let updateManyCalls = 0;

    const mockPrisma = {
      discrepancyCase: {
        findUnique: async () => ({
          id: caseId,
          caseNumber: 'CASE-000001',
          status: CaseStatus.SUBMITTED,
          assigneeId: null,
          assignedAt: null,
        }),
        updateMany: async () => {
          updateManyCalls += 1;
          return { count: 0 };
        },
      },
      caseHistory: {
        create: async (data: any) => {
          history.push(data.data);
          return data.data;
        },
      },
      $transaction: async (_fn: any) => _fn(mockPrisma),
    };

    const service = createServiceWithMockPrisma(mockPrisma);

    await assert.rejects(
      () => service.releaseCase(caseId, operatorId),
      (error: any) => {
        assert.equal(error.status, 409);
        assert.equal(error.response?.code, 'CASE_ASSIGNMENT_CONFLICT');
        return true;
      },
    );

    assert.equal(updateManyCalls, 0);
    assert.equal(history.length, 0);
  });

  it('rejects release when a case is already decided', async () => {
    const history: Array<{
      caseId: string;
      eventType: CaseEventType;
      resultingStatus: CaseStatus;
      performedById: string;
    }> = [];
    const caseId = '123e4567-e89b-12d3-a456-426614174000';
    const operatorId = '123e4567-e89b-12d3-a456-426614174001';

    for (const status of [CaseStatus.APPROVED, CaseStatus.REJECTED] as const) {
      let updateManyCalls = 0;
      const mockPrisma = {
        discrepancyCase: {
          findUnique: async () => ({
            id: caseId,
            caseNumber: 'CASE-000001',
            status,
            assigneeId: operatorId,
            assignedAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
          updateMany: async () => {
            updateManyCalls += 1;
            return { count: 1 };
          },
        },
        caseHistory: {
          create: async (data: any) => {
            history.push(data.data);
            return data.data;
          },
        },
        $transaction: async (_fn: any) => _fn(mockPrisma),
      };

      const service = createServiceWithMockPrisma(mockPrisma);

      await assert.rejects(
        () => service.releaseCase(caseId, operatorId),
        (error: any) => {
          assert.equal(error.status, 409);
          assert.equal(error.response?.code, 'CASE_ALREADY_DECIDED');
          return true;
        },
      );

      assert.equal(updateManyCalls, 0);
      assert.equal(history.length, 0);
    }
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CasesController } from '../src/cases/cases.controller';

describe('cases controller assignment endpoints', () => {
  it('delegates claim to the service', async () => {
    const mockService = {
      claimCase: async (caseId: string, operatorId: string) => ({
        id: caseId,
        caseNumber: 'CASE-000001',
        status: 'SUBMITTED',
        assigneeId: operatorId,
        assignedAt: new Date().toISOString(),
      }),
    };

    const controller = new CasesController(mockService as any);
    const result = await controller.claim('case-1', { id: 'operator-1' });

    assert.equal(result.assigneeId, 'operator-1');
    assert.equal(result.caseNumber, 'CASE-000001');
  });

  it('delegates release to the service', async () => {
    const mockService = {
      releaseCase: async (caseId: string, operatorId: string) => ({
        id: caseId,
        caseNumber: 'CASE-000001',
        status: 'SUBMITTED',
        assigneeId: null,
        assignedAt: null,
      }),
    };

    const controller = new CasesController(mockService as any);
    const result = await controller.release('case-1', { id: 'operator-1' });

    assert.equal(result.assigneeId, null);
    assert.equal(result.assignedAt, null);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ROLES_KEY } from '../src/auth/roles.guard';
import { CasesController } from '../src/cases/cases.controller';

describe('CasesController authorization metadata', () => {
  it('requires MANAGER role for decide method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.decide,
    );
    assert.deepEqual(metadata, ['MANAGER']);
  });

  it('requires OPERATOR role for create method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.create,
    );
    assert.deepEqual(metadata, ['OPERATOR']);
  });

  it('requires OPERATOR role for claim method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.claim,
    );
    assert.deepEqual(metadata, ['OPERATOR']);
  });

  it('requires OPERATOR role for release method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.release,
    );
    assert.deepEqual(metadata, ['OPERATOR']);
  });

  it('does not require role for findAll method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.findAll,
    );
    assert.equal(metadata, undefined);
  });

  it('does not require role for getStats method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.getStats,
    );
    assert.equal(metadata, undefined);
  });

  it('does not require role for findOne method', () => {
    const metadata = Reflect.getOwnMetadata(
      ROLES_KEY,
      CasesController.prototype.findOne,
    );
    assert.equal(metadata, undefined);
  });
});

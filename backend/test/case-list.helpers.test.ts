import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isCaseStatus,
  normalizeCaseListQuery,
} from '../src/cases/case-list.helpers';

describe('case list helpers', () => {
  it('normalizes Persian and Arabic digits', () => {
    assert.equal(normalizeCaseListQuery('  CASE-۰۰۱٠٢٥  '), 'CASE-001025');
  });

  it('accepts only supported case statuses', () => {
    assert.equal(isCaseStatus('SUBMITTED'), true);
    assert.equal(isCaseStatus('APPROVED'), true);
    assert.equal(isCaseStatus('REJECTED'), true);
    assert.equal(isCaseStatus('CLOSED'), false);
  });
});

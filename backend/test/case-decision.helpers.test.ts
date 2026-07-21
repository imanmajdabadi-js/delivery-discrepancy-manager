import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseCaseDecisionInput } from '../src/cases/case-decision.helpers';

describe('case decision helpers', () => {
  it('parses an approval and trims its explanation', () => {
    const result = parseCaseDecisionInput({
      type: 'APPROVE',
      explanation: '  مغایرت با اطلاعات سفارش تأیید شد.  ',
    });

    assert.deepEqual(result.value, {
      type: 'APPROVE',
      explanation: 'مغایرت با اطلاعات سفارش تأیید شد.',
    });
    assert.equal(result.issues.length, 0);
  });

  it('accepts rejection as the second supported decision', () => {
    const result = parseCaseDecisionInput({
      type: 'REJECT',
      explanation: 'مقدار گزارش‌شده با تحویل نهایی مطابقت ندارد.',
    });

    assert.equal(result.value?.type, 'REJECT');
  });

  it('rejects an empty explanation', () => {
    const result = parseCaseDecisionInput({
      type: 'APPROVE',
      explanation: '   ',
    });

    assert.equal(result.value, null);
    assert(
      result.issues.some((issue) => issue.code === 'EXPLANATION_REQUIRED'),
    );
  });

  it('rejects a decision outside the product lifecycle', () => {
    const result = parseCaseDecisionInput({
      type: 'CLOSE',
      explanation: 'پرونده بسته شود.',
    });

    assert.equal(result.value, null);
    assert(
      result.issues.some((issue) => issue.code === 'INVALID_DECISION_TYPE'),
    );
  });
});

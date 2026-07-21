import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isUuid,
  parseCreateCaseInput,
  validateCaseItemsAgainstOrder,
} from '../src/cases/case-validation.helpers';

const orderId = '31111111-1111-4111-8111-111111111111';
const firstItemId = '41111111-1111-4111-8111-111111111111';
const secondItemId = '42222222-2222-4222-8222-222222222222';

describe('case validation helpers', () => {
  it('rejects a body that is not an object', () => {
    const result = parseCreateCaseInput([]);

    assert.equal(result.value, null);
    assert.equal(result.issues[0]?.code, 'INVALID_BODY');
  });

  it('recognizes valid case identifiers', () => {
    assert.equal(isUuid(orderId), true);
    assert.equal(isUuid('not-a-case-id'), false);
    assert.equal(isUuid(null), false);
  });

  it('parses a valid case request', () => {
    const result = parseCreateCaseInput({
      orderId,
      items: [
        { orderItemId: firstItemId, type: 'SHORTAGE', quantity: 2 },
        { orderItemId: firstItemId, type: 'DAMAGED', quantity: 1 },
      ],
    });

    assert(result.value);
    assert.equal(result.issues.length, 0);
    assert.equal(result.value.items.length, 2);
  });

  it('rejects an empty request and non-integer quantity', () => {
    const emptyResult = parseCreateCaseInput({ orderId, items: [] });
    const decimalResult = parseCreateCaseInput({
      orderId,
      items: [{ orderItemId: firstItemId, type: 'SHORTAGE', quantity: 1.5 }],
    });

    assert.equal(emptyResult.value, null);
    assert(emptyResult.issues.some((issue) => issue.code === 'ITEMS_REQUIRED'));
    assert.equal(decimalResult.value, null);
    assert(
      decimalResult.issues.some((issue) => issue.code === 'INVALID_QUANTITY'),
    );
  });

  it('reports invalid identifiers, type, and quantity', () => {
    const result = parseCreateCaseInput({
      orderId: 'invalid-order',
      items: [
        {
          orderItemId: 'invalid-item',
          type: 'LOST',
          quantity: 0,
        },
      ],
    });

    assert.equal(result.value, null);
    assert(result.issues.some((issue) => issue.code === 'INVALID_ORDER_ID'));
    assert(
      result.issues.some((issue) => issue.code === 'INVALID_ORDER_ITEM_ID'),
    );
    assert(
      result.issues.some((issue) => issue.code === 'INVALID_DISCREPANCY_TYPE'),
    );
    assert(result.issues.some((issue) => issue.code === 'INVALID_QUANTITY'));
  });

  it('rejects a duplicate item and discrepancy type', () => {
    const result = parseCreateCaseInput({
      orderId,
      items: [
        { orderItemId: firstItemId, type: 'SHORTAGE', quantity: 1 },
        { orderItemId: firstItemId, type: 'SHORTAGE', quantity: 2 },
      ],
    });

    assert.equal(result.value, null);
    assert(result.issues.some((issue) => issue.code === 'DUPLICATE_ITEM_TYPE'));
  });

  it('checks ownership, individual quantity, and combined quantity', () => {
    const issues = validateCaseItemsAgainstOrder(
      [
        { orderItemId: firstItemId, type: 'SHORTAGE', quantity: 4 },
        { orderItemId: firstItemId, type: 'DAMAGED', quantity: 3 },
        { orderItemId: secondItemId, type: 'SHORTAGE', quantity: 13 },
        {
          orderItemId: '49999999-9999-4999-8999-999999999999',
          type: 'DAMAGED',
          quantity: 1,
        },
      ],
      [
        { id: firstItemId, deliveredQuantity: 6 },
        { id: secondItemId, deliveredQuantity: 12 },
      ],
    );

    assert(
      issues.some((issue) => issue.code === 'TOTAL_QUANTITY_EXCEEDS_DELIVERED'),
    );
    assert(issues.some((issue) => issue.code === 'QUANTITY_EXCEEDS_DELIVERED'));
    assert(issues.some((issue) => issue.code === 'ITEM_NOT_IN_ORDER'));
  });
});

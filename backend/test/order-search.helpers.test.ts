import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OrderStatus } from '../src/generated/prisma/client';
import {
  getOrderEligibility,
  getPhoneCandidate,
  normalizeSearchQuery,
} from '../src/orders/order-search.helpers';

describe('order search helpers', () => {
  it('normalizes Persian and Arabic digits', () => {
    assert.equal(normalizeSearchQuery('  ORD-۱۴۰۵-٠٠١٢٥  '), 'ORD-1405-00125');
  });

  it('extracts a compact phone number', () => {
    assert.equal(
      getPhoneCandidate(normalizeSearchQuery('۰۹۱۲ ۱۲۳ ۴۵۶۷')),
      '09121234567',
    );
    assert.equal(getPhoneCandidate('ORD-1405-00125'), null);
  });

  it('accepts only delivered orders with at least one item', () => {
    assert.deepEqual(getOrderEligibility(OrderStatus.DELIVERED, 3), {
      eligible: true,
      reason: null,
    });
    assert.deepEqual(getOrderEligibility(OrderStatus.PROCESSING, 1), {
      eligible: false,
      reason: 'NOT_DELIVERED',
    });
    assert.deepEqual(getOrderEligibility(OrderStatus.DELIVERED, 0), {
      eligible: false,
      reason: 'NO_ITEMS',
    });
  });
});

import { describe, expect, it } from 'vitest';
import { validateCaseItems } from './validation';
import type { OrderSearchResult } from '../../../types';

describe('validateCaseItems', () => {
  const mockOrder = {
    items: [
      { id: 'item-1', deliveredQuantity: 5 },
      { id: 'item-2', deliveredQuantity: 2 }
    ]
  } as unknown as OrderSearchResult;

  it('should return error if no items are selected', () => {
    const result = validateCaseItems(mockOrder, []);
    expect(result.errors.form).toBe('حداقل یک نوع مغایرت برای یکی از اقلام انتخاب کنید.');
  });

  it('should validate valid quantities', () => {
    const selected = [
      { item: { id: 'item-1', deliveredQuantity: 5 }, type: 'SHORTAGE' as const, value: '2' }
    ];
    const result = validateCaseItems(mockOrder, selected);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result.requestItems[0]).toEqual({ orderItemId: 'item-1', type: 'SHORTAGE', quantity: 2 });
  });

  it('should return error for non-numeric quantities', () => {
    const selected = [
      { item: { id: 'item-1', deliveredQuantity: 5 }, type: 'SHORTAGE' as const, value: 'abc' }
    ];
    const result = validateCaseItems(mockOrder, selected);
    expect(result.errors['item-1:SHORTAGE']).toBe('یک عدد صحیح بزرگ‌تر از صفر وارد کنید.');
  });

  it('should return error for quantities exceeding delivered amount', () => {
    const selected = [
      { item: { id: 'item-1', deliveredQuantity: 5 }, type: 'SHORTAGE' as const, value: '10' }
    ];
    const result = validateCaseItems(mockOrder, selected);
    expect(result.errors['item-1:SHORTAGE']).toBe('مقدار از تعداد تحویل‌شده بیشتر است.');
  });

  it('should return error if sum of shortages and damages exceeds delivered amount', () => {
    const selected = [
      { item: { id: 'item-1', deliveredQuantity: 5 }, type: 'SHORTAGE' as const, value: '3' },
      { item: { id: 'item-1', deliveredQuantity: 5 }, type: 'DAMAGED' as const, value: '3' }
    ];
    const result = validateCaseItems(mockOrder, selected);
    expect(result.errors['item-1:sum']).toBe('مجموع کسری و آسیب‌دیدگی از مقدار تحویل‌شده بیشتر است.');
  });
});

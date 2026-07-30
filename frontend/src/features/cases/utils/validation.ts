import type {
  CaseDiscrepancyType,
  CreateCaseItemInput,
  OrderSearchResult,
} from '../../../types';

export interface ValidationResult {
  requestItems: CreateCaseItemInput[];
  errors: Record<string, string>;
}

/**
 * Validates selected items for case creation.
 * Checks for:
 * - At least one item selected
 * - Valid integer quantities
 * - Quantities not exceeding delivered amounts
 * - Sum of shortage and damaged not exceeding delivered amount per item
 */
export function validateCaseItems(
  order: OrderSearchResult,
  selectedEntries: Array<{
    item: { id: string; deliveredQuantity: number };
    type: CaseDiscrepancyType;
    value: string;
  }>,
): ValidationResult {
  const errors: Record<string, string> = {};
  const requestItems: CreateCaseItemInput[] = [];
  const totals = new Map<string, number>();

  if (selectedEntries.length === 0) {
    errors.form = 'حداقل یک نوع مغایرت برای یکی از اقلام انتخاب کنید.';
    return { requestItems, errors };
  }

  selectedEntries.forEach(({ item, type, value }) => {
    const errorKey = `${item.id}:${type}`;

    if (!/^\d+$/.test(value)) {
      errors[errorKey] = 'یک عدد صحیح بزرگ‌تر از صفر وارد کنید.';
      return;
    }

    const quantity = Number(value);

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      errors[errorKey] = 'یک عدد صحیح بزرگ‌تر از صفر وارد کنید.';
      return;
    }

    if (quantity > item.deliveredQuantity) {
      errors[errorKey] = 'مقدار از تعداد تحویل‌شده بیشتر است.';
    }

    totals.set(item.id, (totals.get(item.id) ?? 0) + quantity);
    requestItems.push({ orderItemId: item.id, type, quantity });
  });

  totals.forEach((total, itemId) => {
    const item = order.items.find((orderItem) => orderItem.id === itemId);

    if (item && total > item.deliveredQuantity) {
      errors[`${itemId}:sum`] =
        'مجموع کسری و آسیب‌دیدگی از مقدار تحویل‌شده بیشتر است.';
    }
  });

  return { requestItems, errors };
}

import { OrderStatus } from '../generated/prisma/client';

export const SEARCH_QUERY_MIN_LENGTH = 3;
export const SEARCH_QUERY_MAX_LENGTH = 64;

export type OrderEligibilityReason = 'NOT_DELIVERED' | 'NO_ITEMS';

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

export function normalizeSearchQuery(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .trim();
}

export function getPhoneCandidate(query: string) {
  const compactValue = query.replace(/[\s()-]/g, '');

  return /^\+?\d{10,15}$/.test(compactValue) ? compactValue : null;
}

export function getOrderEligibility(
  status: OrderStatus,
  deliveredItemCount: number,
): { eligible: boolean; reason: OrderEligibilityReason | null } {
  if (status !== OrderStatus.DELIVERED) {
    return { eligible: false, reason: 'NOT_DELIVERED' };
  }

  if (deliveredItemCount === 0) {
    return { eligible: false, reason: 'NO_ITEMS' };
  }

  return { eligible: true, reason: null };
}

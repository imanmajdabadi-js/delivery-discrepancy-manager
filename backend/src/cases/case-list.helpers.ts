import { CaseStatus } from '../generated/prisma/client';

export const CASE_LIST_QUERY_MAX_LENGTH = 64;

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

export function normalizeCaseListQuery(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .trim();
}

export function isCaseStatus(value: string): value is CaseStatus {
  return (
    value === CaseStatus.SUBMITTED ||
    value === CaseStatus.APPROVED ||
    value === CaseStatus.REJECTED
  );
}

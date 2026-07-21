import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatPhoneNumber,
  normalizeSearchQuery,
  toPersianDigits,
} from '.';

describe('Persian display utilities', () => {
  it('normalizes Persian and Arabic digits in search values', () => {
    expect(normalizeSearchQuery(' ۰۹۱۲۱۲۳۴۵۶۷ ')).toBe('09121234567');
    expect(normalizeSearchQuery('١٤٠٥-٠١٢٥')).toBe('1405-0125');
  });

  it('converts Latin digits without changing the surrounding text', () => {
    expect(toPersianDigits('CASE-001025')).toBe('CASE-۰۰۱۰۲۵');
  });

  it('groups a complete mobile number for display', () => {
    expect(formatPhoneNumber('09121234567')).toBe('۰۹۱۲ ۱۲۳ ۴۵۶۷');
  });

  it('keeps an incomplete phone value readable', () => {
    expect(formatPhoneNumber('02188')).toBe('۰۲۱۸۸');
  });

  it('uses the Persian calendar and Tehran time', () => {
    expect(formatDateTime('2026-07-21T12:00:00.000Z')).toBe(
      '۳۰ تیر ۱۴۰۵، ۱۵:۳۰',
    );
    expect(formatDateTime('invalid-date')).toBe('زمان نامشخص');
  });
});

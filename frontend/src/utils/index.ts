const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
const persianDateTimeFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
});

export function normalizeSearchQuery(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .trim();
}

export function toPersianDigits(value: string | number) {
  return String(value).replace(
    /\d/g,
    (digit) => persianDigits[Number(digit)] ?? digit,
  );
}

export function formatPhoneNumber(value: string) {
  const compactValue = value.replace(/\D/g, '');

  if (compactValue.length !== 11) {
    return toPersianDigits(value);
  }

  return toPersianDigits(
    `${compactValue.slice(0, 4)} ${compactValue.slice(4, 7)} ${compactValue.slice(7)}`,
  );
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'زمان نامشخص';
  }

  return persianDateTimeFormatter.format(date);
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
}

export interface JwtPayload {
  sub?: string;
  role?: string;
}

export function getUserRole(): string | null {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return null;
  }

  const segments = token.split('.');

  if (segments.length < 3) {
    return null;
  }

  try {
    const claims = JSON.parse(decodeBase64Url(segments[1])) as JwtPayload;
    return claims.role ?? null;
  } catch {
    return null;
  }
}

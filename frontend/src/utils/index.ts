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

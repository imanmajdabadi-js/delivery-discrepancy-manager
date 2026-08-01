import type { CaseDetailsResponse, CaseDiscrepancyType } from '../types';
import { toPersianDigits } from '../utils';

const typeDetails: Record<
  CaseDiscrepancyType,
  { label: string; className: string; edgeClassName: string }
> = {
  SHORTAGE: {
    label: 'کسری',
    className: 'bg-accent-sky-soft text-accent-sky',
    edgeClassName: 'border-s-accent-sky',
  },
  DAMAGED: {
    label: 'آسیب‌دیدگی',
    className: 'bg-accent-violet-soft text-accent-violet',
    edgeClassName: 'border-s-accent-violet',
  },
};

export function CaseDiscrepancyList({
  items,
}: {
  items: CaseDetailsResponse['items'];
}) {
  return (
    <section
      aria-labelledby="case-items-title"
      className="rounded-3xl border border-line bg-surface p-5 shadow-[0_14px_42px_rgba(24,57,51,0.045)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="case-items-title"
            className="text-base font-semibold text-ink"
          >
            اقلام دارای مغایرت
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-6 text-muted">
            مقدار گزارش‌شده در کنار مقدار تحویل هر قلم نمایش داده شده است.
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-brand-soft px-2.5 py-1 text-[0.75rem] font-semibold text-brand-strong">
          {toPersianDigits(items.length)} ردیف
        </span>
      </div>

      <ul className="mt-5 space-y-3">
        {items.map((item) => {
          const details = typeDetails[item.type];

          return (
            <li
              key={item.id}
              className={`grid gap-4 rounded-2xl border border-s-4 border-line bg-surface-soft px-4 py-4 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center sm:px-5 ${details.edgeClassName}`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="wrap-anywhere text-sm leading-7 font-semibold text-ink sm:text-[0.9375rem]">
                    {item.orderItem.productName}
                  </h3>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold ${details.className}`}
                  >
                    {details.label}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-subtle">
                  <span dir="ltr" className="wrap-anywhere">
                    {item.orderItem.sku}
                  </span>
                  <span>
                    تحویل‌شده:‌{' '}
                    {toPersianDigits(item.orderItem.deliveredQuantity)}{' '}
                    {item.orderItem.unit}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-surface px-3 py-2.5 sm:text-center">
                <p className="text-[0.6875rem] font-semibold text-subtle">
                  مقدار مغایرت
                </p>
                <p className="mt-0.5 text-base font-bold text-ink">
                  {toPersianDigits(item.quantity)} {item.orderItem.unit}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

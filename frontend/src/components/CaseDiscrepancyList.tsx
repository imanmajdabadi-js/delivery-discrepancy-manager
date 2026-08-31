import type { CaseDetailsResponse, CaseDiscrepancyType } from '../types';
import { toPersianDigits } from '../utils';

const typeDetails: Record<
  CaseDiscrepancyType,
  { label: string; className: string }
> = {
  SHORTAGE: {
    label: 'کسری',
    className: 'bg-danger-soft text-danger',
  },
  DAMAGED: {
    label: 'آسیب‌دیدگی',
    className: 'bg-accent-soft text-accent',
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
              className="grid gap-4 rounded-2xl border border-line bg-surface/90 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center sm:px-5 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-[0_6px_18px_rgba(24,57,51,0.05)]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-lg ${
                      item.type === 'SHORTAGE'
                        ? 'bg-danger-soft text-danger'
                        : 'bg-accent-soft text-accent'
                    }`}
                  >
                    {item.type === 'SHORTAGE' ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5"
                      >
                        <path d="M16 12V8a4 4 0 0 0-8 0v4M8 10V8a4 4 0 1 1 8 0v2" />
                        <path d="M12 10v6" />
                        <path d="M8 16h8" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5"
                      >
                        <path d="M10.29 3.86 7.46 7.5a1 1 0 0 0 .75 1.5h1.39a1 1 0 0 1 .75 1.5l-2.83 3.64a1 1 0 0 0 .15 1.4l2.24 1.6a1 1 0 0 1 .35 1.18l-.14 1.3a1 1 0 0 0 1.12 1.12l1.3-.14a1 1 0 0 1 1.18.35l3.64-2.83a1 1 0 0 1 1.5.75v1.3a1 1 0 0 0 1.5.75l3.64-2.83a1 1 0 0 1 1.5.75v1.3a1 1 0 0 1 1.5.75l3.64-2.83" />
                      </svg>
                    )}
                  </span>
                  <h3 className="wrap-anywhere text-sm leading-7 font-semibold text-ink sm:text-[0.9375rem]">
                    {item.orderItem.productName}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold ${details.className}`}
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
              <div className="rounded-xl border border-line bg-surface-soft px-3 py-2.5 sm:text-center">
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

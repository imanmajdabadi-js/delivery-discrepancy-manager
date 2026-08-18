import type { OrderSearchResult, OrderStatus } from '../types';
import { formatPhoneNumber, toPersianDigits } from '../utils';

const statusDetails: Record<OrderStatus, { label: string; className: string }> =
  {
    DELIVERED: {
      label: 'تحویل‌شده',
      className: 'bg-success-soft text-success-strong',
    },
    PROCESSING: {
      label: 'در حال پردازش',
      className: 'bg-warning-soft text-warning-strong',
    },
    CANCELLED: {
      label: 'لغوشده',
      className: 'bg-danger-soft text-danger-strong',
    },
  };

function EligibilityMessage({ order }: { order: OrderSearchResult }) {
  if (order.eligibility.eligible) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl border border-success/15 bg-success-soft px-4 py-3 text-success-strong">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 size-5 shrink-0"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
        <div>
          <p className="text-sm font-semibold">قابل ثبت پرونده</p>
          <p className="mt-0.5 text-[0.8125rem] leading-6 text-success-strong/85">
            سفارش تحویل نهایی شده و اقلام آن برای بررسی آماده‌اند.
          </p>
        </div>
      </div>
    );
  }

  const hasNoItems = order.eligibility.reason === 'NO_ITEMS';

  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-warning/15 bg-warning-soft px-4 py-3 text-warning-strong">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 size-5 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5m0 3h.01" />
      </svg>
      <div>
        <p className="text-sm font-semibold">
          {hasNoItems ? 'قلم تحویل‌شده‌ای وجود ندارد' : 'سفارش قابل بررسی نیست'}
        </p>
        <p className="mt-0.5 text-[0.8125rem] leading-6 text-warning-strong/85">
          {hasNoItems
            ? 'برای این سفارش هیچ قلمی با مقدار تحویل‌شده ثبت نشده است.'
            : 'فقط سفارش‌هایی که تحویل آن‌ها نهایی شده باشد مبنای پرونده قرار می‌گیرند.'}
        </p>
      </div>
    </div>
  );
}

function OrderResultCard({
  order,
  isSelected,
  onSelect,
}: {
  order: OrderSearchResult;
  isSelected: boolean;
  onSelect: (orderId: string) => void;
}) {
  const status = statusDetails[order.status];

  return (
    <article
      className={`result-card surface-enter overflow-hidden rounded-3xl border bg-surface shadow-[0_12px_40px_rgba(24,57,51,0.055)] ${
        isSelected ? 'border-brand' : 'border-line'
      }`}
    >
      <div className="flex flex-col gap-4 border-b border-line bg-surface-soft/75 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-[0.8125rem] font-semibold text-muted">
            شماره سفارش
          </p>
          <h3
            dir="ltr"
            className="wrap-anywhere mt-1 text-left text-lg leading-8 font-bold tracking-[0.02em] text-ink sm:text-xl"
          >
            {order.orderNumber}
          </h3>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-[0.8125rem] font-semibold tracking-wide ${status.className}`}
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-current" />
          {status.label}
        </span>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-[0.75rem] font-semibold text-subtle">مشتری</p>
          <p className="wrap-anywhere mt-1 text-sm leading-7 font-semibold text-ink sm:text-[0.9375rem]">
            {order.customer.fullName}
          </p>
        </div>
        <div>
          <p className="text-[0.75rem] font-semibold text-subtle">کد مشتری</p>
          <p
            dir="ltr"
            className="wrap-anywhere mt-1 text-left text-sm leading-7 text-ink"
          >
            {order.customer.customerCode}
          </p>
        </div>
        <div>
          <p className="text-[0.75rem] font-semibold text-subtle">
            شماره موبایل
          </p>
          <p dir="ltr" className="mt-1 text-left text-sm leading-7 text-ink">
            {formatPhoneNumber(order.customer.phone)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <EligibilityMessage order={order} />
        {order.eligibility.eligible ? (
          <button
            type="button"
            aria-pressed={isSelected}
            className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto ${
              isSelected
                ? 'cursor-default border border-brand-mild bg-brand-soft text-brand-strong'
                : 'bg-brand text-white shadow-[0_8px_20px_rgba(15,118,110,0.16)] hover:bg-brand-strong'
            }`}
            onClick={() => onSelect(order.id)}
          >
            {isSelected ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            ) : null}
            {isSelected ? 'سفارش انتخاب‌شده' : 'انتخاب این سفارش'}
          </button>
        ) : null}
      </div>

      {order.eligibility.eligible ? (
        <div className="border-t border-line px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-ink">اقلام تحویل‌شده</h4>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[0.75rem] font-semibold text-brand-strong">
              {toPersianDigits(order.items.length)} قلم
            </span>
          </div>

          <div
            aria-hidden="true"
            className="mb-2 hidden grid-cols-[minmax(0,1fr)_8rem_6rem] gap-4 px-3 text-[0.75rem] font-semibold text-subtle sm:grid"
          >
            <span>نام محصول</span>
            <span>کد کالا</span>
            <span>مقدار</span>
          </div>
          <ul className="space-y-2.5">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="grid gap-3 rounded-2xl border border-line bg-surface-soft px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_8rem_6rem] sm:items-center sm:gap-4 sm:rounded-xl sm:border-transparent sm:py-3"
              >
                <div className="min-w-0">
                  <span className="text-[0.75rem] font-semibold text-subtle sm:hidden">
                    نام محصول
                  </span>
                  <p className="wrap-anywhere mt-0.5 text-sm leading-6 font-semibold text-ink sm:mt-0 sm:font-normal">
                    {item.productName}
                  </p>
                </div>
                <div>
                  <span className="text-[0.75rem] font-semibold text-subtle sm:hidden">
                    کد کالا
                  </span>
                  <p
                    dir="ltr"
                    className="wrap-anywhere mt-0.5 text-left text-[0.8125rem] leading-6 text-muted sm:mt-0"
                  >
                    {item.sku}
                  </p>
                </div>
                <div>
                  <span className="text-[0.75rem] font-semibold text-subtle sm:hidden">
                    مقدار تحویل
                  </span>
                  <p className="mt-0.5 text-sm leading-6 text-ink sm:mt-0">
                    {toPersianDigits(item.deliveredQuantity)} {item.unit}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function OrderSearchResults({
  results,
  selectedOrderId,
  onSelectOrder,
}: {
  results: OrderSearchResult[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
}) {
  return (
    <section aria-labelledby="search-results-title" className="mt-7">
      <div className="mb-3.5 flex items-center justify-between gap-4 px-1">
        <h2
          id="search-results-title"
          className="text-base font-semibold text-ink"
        >
          نتیجه جست‌وجو
        </h2>
        <span className="text-[0.8125rem] text-muted">
          {toPersianDigits(results.length)} سفارش
        </span>
      </div>
      <div className="space-y-4">
        {results.map((order) => (
          <OrderResultCard
            key={order.id}
            order={order}
            isSelected={order.id === selectedOrderId}
            onSelect={onSelectOrder}
          />
        ))}
      </div>
    </section>
  );
}

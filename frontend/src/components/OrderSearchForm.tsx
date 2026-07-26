import { type FormEvent } from 'react';

interface OrderSearchFormProps {
  query: string;
  error: string | null;
  isSubmitting: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function OrderSearchForm({
  query,
  error,
  isSubmitting,
  onQueryChange,
  onSubmit,
}: OrderSearchFormProps) {
  const descriptionId = error ? 'order-search-error' : 'order-search-hint';

  return (
    <form
      aria-busy={isSubmitting}
      className="search-panel surface-enter rounded-3xl border border-line bg-surface p-5 shadow-[0_18px_55px_rgba(24,57,51,0.07)] sm:p-7"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5.5"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
            <path d="M8.5 11h5" />
          </svg>
        </span>
        <div>
          <h2 className="text-base leading-7 font-semibold text-ink sm:text-[1.0625rem]">
            جست‌وجوی سفارش
          </h2>
          <p className="mt-0.5 text-sm leading-7 text-muted">
            یکی از شناسه‌های قطعی سفارش یا مشتری را وارد کنید.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="order-search-query"
          className="mb-2 block text-sm font-semibold text-ink"
        >
          شماره سفارش، کد مشتری یا شماره موبایل
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <input
              id="order-search-query"
              name="query"
              type="search"
              dir="auto"
              autoComplete="off"
              maxLength={64}
              value={query}
              aria-describedby={descriptionId}
              aria-invalid={Boolean(error)}
              className="h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[0.9375rem] text-ink outline-none transition placeholder:text-subtle hover:border-brand-mild focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-mild/55 aria-invalid:border-danger aria-invalid:ring-danger-soft"
              placeholder="مثلاً ORD-1405-..."
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {error ? (
              <p
                id="order-search-error"
                role="alert"
                className="wrap-anywhere mt-2 text-sm leading-6 text-danger-strong"
              >
                {error}
              </p>
            ) : (
              <p
                id="order-search-hint"
                className="mt-2 text-[0.8125rem] leading-6 text-muted"
              >
                رقم‌های فارسی و انگلیسی هر دو پذیرفته می‌شوند.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,118,110,0.2)] transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-65 sm:min-w-29"
          >
            {isSubmitting ? (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
              />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-4.5"
              >
                <circle cx="10.5" cy="10.5" r="6" />
                <path d="m15 15 4 4" />
              </svg>
            )}
            {isSubmitting ? 'در حال بررسی' : 'جست‌وجو'}
          </button>
        </div>
      </div>
    </form>
  );
}

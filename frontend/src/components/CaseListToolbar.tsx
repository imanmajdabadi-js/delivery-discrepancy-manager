import { type FormEvent } from 'react';
import type { CaseStatus } from '../types';

interface CaseListToolbarProps {
  query: string;
  status: CaseStatus | null;
  validationError: string | null;
  isFetching: boolean;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: CaseStatus | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
}

export function CaseListToolbar({
  query,
  status,
  validationError,
  isFetching,
  hasFilters,
  onQueryChange,
  onStatusChange,
  onSubmit,
  onClear,
}: CaseListToolbarProps) {
  return (
    <form
      aria-busy={isFetching}
      className="surface-enter mt-8 rounded-2xl border border-line bg-surface p-4 shadow-[0_10px_35px_rgba(24,57,51,0.05)] sm:p-5"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_13rem_auto] md:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            جست‌وجو در پرونده‌ها
          </span>
          <span className="relative block">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 4 4" />
            </svg>
            <input
              value={query}
              type="search"
              maxLength={65}
              placeholder="شماره پرونده یا سفارش"
              aria-invalid={validationError ? true : undefined}
              aria-describedby={
                validationError ? 'case-list-search-error' : undefined
              }
              className="h-11 w-full rounded-xl border border-line-strong bg-surface pr-11 pl-3 text-sm text-ink outline-none transition placeholder:text-muted/80 focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft"
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            وضعیت پرونده
          </span>
          <select
            value={status ?? ''}
            className="h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink outline-none transition focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft"
            onChange={(event) =>
              onStatusChange((event.target.value || null) as CaseStatus | null)
            }
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="SUBMITTED">ثبت‌شده</option>
            <option value="APPROVED">تأییدشده</option>
            <option value="REJECTED">ردشده</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isFetching}
          className="motion-safe:transition-all motion-safe:duration-180 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong hover:shadow-[0_8px_22px_rgba(13,123,132,0.25)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
        >
          {isFetching ? 'در حال بررسی...' : 'جست‌وجو'}
        </button>
      </div>

      <div className="mt-3 flex min-h-6 flex-wrap items-start justify-between gap-2">
        {validationError ? (
          <p
            id="case-list-search-error"
            className="wrap-anywhere text-sm text-danger"
          >
            {validationError}
          </p>
        ) : (
          <p className="text-[0.8125rem] leading-6 text-muted">
            بخشی از شماره پرونده یا شماره سفارش را وارد کنید.
          </p>
        )}

        {hasFilters ? (
          <button
            type="button"
            className="rounded-lg text-[0.8125rem] font-semibold text-brand transition hover:text-brand-strong focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
            onClick={onClear}
          >
            پاک‌کردن جست‌وجو و فیلتر
          </button>
        ) : null}
      </div>
    </form>
  );
}

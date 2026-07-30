import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CaseList } from '../../../components/CaseList';
import { CaseListNotice } from '../../../components/CaseListNotice';
import { CaseListSkeleton } from '../../../components/CaseListSkeleton';
import { CaseListToolbar } from '../../../components/CaseListToolbar';
import { CaseStats } from '../../../components/CaseStats';
import { useCases } from '../../../hooks/useCases';
import { ApiError } from '../../../services';
import type { CaseStatus } from '../../../types';
import { normalizeSearchQuery, toPersianDigits } from '../../../utils';

const maximumQueryLength = 64;

export function ManagerReviewPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [status, setStatus] = useState<CaseStatus | null>('SUBMITTED');
  const [validationError, setValidationError] = useState<string | null>(null);
  const cases = useCases(submittedQuery, status);
  const hasActiveFilters = Boolean(
    submittedQuery || (status && status !== 'SUBMITTED'),
  );

  function handleQueryChange(value: string) {
    setQuery(value);

    if (validationError) {
      setValidationError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cases.isFetching) {
      return;
    }

    const normalizedQuery = normalizeSearchQuery(query);

    if (normalizedQuery.length > maximumQueryLength) {
      setValidationError('عبارت جست‌وجو نمی‌تواند بیشتر از ۶۴ نویسه باشد.');
      return;
    }

    setValidationError(null);
    setQuery(normalizedQuery);

    if (normalizedQuery === submittedQuery) {
      void cases.refetch();
      return;
    }

    setSubmittedQuery(normalizedQuery);
  }

  function handleStatusChange(value: CaseStatus | null) {
    setStatus(value);
  }

  function handleClear() {
    setQuery('');
    setSubmittedQuery('');
    setStatus('SUBMITTED');
    setValidationError(null);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <header className="max-w-3xl">
          <p className="mb-2.5 text-[0.8125rem] font-semibold text-brand sm:text-sm">
            صادرکننده تصمیم
          </p>
          <h1 className="text-[1.625rem] leading-[1.55] font-bold text-ink sm:text-[1.75rem]">
            پرونده‌های در انتظار بررسی
          </h1>
          <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-7.5 text-muted sm:text-base sm:leading-8">
            پرونده‌های ثبت‌شده را بررسی کنید و نتیجه نهایی را با توضیح مناسب ثبت
            نمایید.
          </p>
        </header>

        <Link
          to="/"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand sm:self-auto"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-4.5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          فهرست همه پرونده‌ها
        </Link>
      </div>

      <div className="mt-8">
        <CaseStats />
      </div>

      <CaseListToolbar
        query={query}
        status={status}
        validationError={validationError}
        isFetching={cases.isFetching}
        hasFilters={hasActiveFilters}
        onQueryChange={handleQueryChange}
        onStatusChange={handleStatusChange}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      <div aria-live="polite" aria-busy={cases.isFetching}>
        {cases.isPending ? <CaseListSkeleton /> : null}

        {!cases.isPending && cases.isError ? (
          <CaseListNotice
            kind="error"
            description={
              cases.error instanceof ApiError
                ? cases.error.message
                : 'ارتباط با سامانه برقرار نشد. اتصال را بررسی کنید و دوباره تلاش کنید.'
            }
            onRetry={() => void cases.refetch()}
          />
        ) : null}

        {!cases.isPending && cases.data?.results.length === 0 ? (
          <CaseListNotice
            kind={hasActiveFilters ? 'filtered-empty' : 'initial-empty'}
            onClear={handleClear}
          />
        ) : null}

        {!cases.isPending && cases.data?.results.length ? (
          <>
            <p className="mt-5 text-[0.8125rem] text-muted">
              {toPersianDigits(cases.data.results.length)} پرونده نمایش داده
              می‌شود.
            </p>
            <CaseList cases={cases.data.results} />
          </>
        ) : null}
      </div>
    </main>
  );
}

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CaseCreationSuccess } from '../../../components/CaseCreationSuccess';
import { CaseItemsForm } from '../../../components/CaseItemsForm';
import { OrderSearchForm } from '../../../components/OrderSearchForm';
import { OrderSearchNotice } from '../../../components/OrderSearchNotice';
import { OrderSearchResults } from '../../../components/OrderSearchResults';
import { OrderSearchSkeleton } from '../../../components/OrderSearchSkeleton';
import { useOrderSearch } from '../../../hooks/useOrderSearch';
import { ApiError } from '../../../services';
import type { CreateCaseResponse } from '../../../types';
import { normalizeSearchQuery } from '../../../utils';

const minimumQueryLength = 3;
const maximumQueryLength = 64;

export function CreateCasePage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<{
    createdCase: CreateCaseResponse;
    itemCount: number;
  } | null>(null);
  const search = useOrderSearch(submittedQuery);
  const selectedOrder =
    search.data?.results.find(
      (order) => order.id === selectedOrderId && order.eligibility.eligible,
    ) ?? null;

  function handleQueryChange(value: string) {
    setQuery(value);

    if (validationError) {
      setValidationError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = normalizeSearchQuery(query);

    if (normalizedQuery.length < minimumQueryLength) {
      setValidationError('حداقل ۳ نویسه برای جست‌وجو وارد کنید.');
      setSubmittedQuery(null);
      setSelectedOrderId(null);
      return;
    }

    if (normalizedQuery.length > maximumQueryLength) {
      setValidationError('عبارت جست‌وجو نمی‌تواند بیشتر از ۶۴ نویسه باشد.');
      setSubmittedQuery(null);
      setSelectedOrderId(null);
      return;
    }

    setValidationError(null);
    setQuery(normalizedQuery);
    setSelectedOrderId(null);

    if (normalizedQuery === submittedQuery) {
      void search.refetch();
      return;
    }

    setSubmittedQuery(normalizedQuery);
  }

  function resetCreationFlow() {
    setQuery('');
    setSubmittedQuery(null);
    setValidationError(null);
    setSelectedOrderId(null);
    setCreationResult(null);
  }

  if (creationResult) {
    return (
      <CaseCreationSuccess
        createdCase={creationResult.createdCase}
        itemCount={creationResult.itemCount}
        onCreateAnother={resetCreationFlow}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-muted transition hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        بازگشت به پرونده‌ها
      </Link>

      <header className="mt-5 max-w-3xl">
        <span className="inline-flex rounded-full bg-accent-violet-soft px-3 py-1 text-[0.75rem] font-semibold text-accent-violet">
          ایجاد پرونده جدید
        </span>
        <h1 className="mt-3 text-[1.625rem] leading-[1.55] font-bold text-ink sm:text-[1.875rem]">
          ابتدا سفارش را پیدا کنید
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-7.5 text-muted sm:text-base sm:leading-8">
          سفارش و اقلام تحویل‌شده را بررسی کنید تا پرونده به اطلاعات درست متصل
          شود.
        </p>
      </header>

      <div className="mt-7 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-5">
        <OrderSearchForm
          query={query}
          error={validationError}
          isSubmitting={search.isFetching}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
        />

        <aside className="rounded-3xl border border-line bg-surface/80 p-5 lg:p-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-xl bg-accent-amber-soft text-accent-amber"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8h.01" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold text-ink">
              سفارش قابل بررسی است اگر
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-[0.8125rem] leading-6 text-muted">
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
              />
              تحویل سفارش نهایی شده باشد.
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-violet"
              />
              دست‌کم یک قلم تحویل‌شده داشته باشد.
            </li>
          </ul>
        </aside>
      </div>

      <div aria-live="polite">
        {search.isFetching ? <OrderSearchSkeleton /> : null}

        {!search.isFetching && search.isError ? (
          <OrderSearchNotice
            kind="error"
            title="دریافت سفارش ممکن نشد"
            description={
              search.error instanceof ApiError
                ? search.error.message
                : 'ارتباط با سامانه برقرار نشد. اتصال را بررسی کنید و دوباره تلاش کنید.'
            }
            onRetry={() => void search.refetch()}
          />
        ) : null}

        {!search.isFetching && search.data?.results.length === 0 ? (
          <OrderSearchNotice
            kind="empty"
            title="سفارشی پیدا نشد"
            description="شناسه واردشده را دوباره بررسی کنید. برای نتیجه دقیق، شماره سفارش، کد مشتری یا شماره موبایل کامل را وارد کنید."
          />
        ) : null}

        {!search.isFetching && search.data?.results.length ? (
          <OrderSearchResults
            results={search.data.results}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
          />
        ) : null}
      </div>

      {!search.isFetching && selectedOrder ? (
        <CaseItemsForm
          key={selectedOrder.id}
          order={selectedOrder}
          onChangeOrder={() => setSelectedOrderId(null)}
          onCreated={(createdCase, itemCount) =>
            setCreationResult({ createdCase, itemCount })
          }
        />
      ) : null}
    </main>
  );
}

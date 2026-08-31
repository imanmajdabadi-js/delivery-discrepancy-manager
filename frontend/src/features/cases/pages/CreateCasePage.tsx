import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { CaseItemsForm } from '../../../components/CaseItemsForm';
import { OrderSearchForm } from '../../../components/OrderSearchForm';
import { OrderSearchNotice } from '../../../components/OrderSearchNotice';
import { OrderSearchResults } from '../../../components/OrderSearchResults';
import { OrderSearchSkeleton } from '../../../components/OrderSearchSkeleton';
import { useOrderSearch } from '../../../hooks/useOrderSearch';
import { ApiError } from '../../../services';
import { normalizeSearchQuery } from '../../../utils';
import type { CreateCaseResponse } from '../../../types';

const minimumQueryLength = 3;
const maximumQueryLength = 64;

type Step = 'search' | 'items' | 'review';

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: Array<{ key: Step; label: string; short: string }> = [
    { key: 'search', label: 'جست‌وجوی سفارش', short: 'جست‌وجو' },
    { key: 'items', label: 'ثبت مغایرت', short: 'مغایرت' },
    { key: 'review', label: 'بررسی نهایی', short: 'بررسی' },
  ];

  return (
    <nav
      aria-label="مراحل ساخت پرونده"
      className="mb-6 motion-safe:delay-75 motion-safe:page-enter"
    >
      <ol className="flex items-center justify-center gap-3 text-sm font-medium">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted =
            steps.findIndex((s) => s.key === currentStep) > index;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.key} className="flex items-center gap-3">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'scale-105 bg-brand text-white ring-2 ring-brand-mild/50'
                    : isCompleted
                      ? 'bg-brand text-white'
                      : 'border border-line bg-surface-soft text-muted'
                }`}
              >
                {isCompleted ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M5 12l5 5 9-9" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`hidden sm:inline ${
                  isActive ? 'text-ink' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
              <span
                className={`sm:hidden ${isActive ? 'text-ink' : 'text-muted'}`}
              >
                {step.short}
              </span>
              {isLast ? null : (
                <span
                  aria-hidden="true"
                  className={`motion-safe:duration-200 ${
                    isCompleted ? 'w-8 bg-brand' : 'w-8 bg-line'
                  } h-0.5 rounded-full`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SuccessState({
  createdCase,
  onViewCase,
}: {
  createdCase: CreateCaseResponse;
  onViewCase: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
  }, []);

  useEffect(function restoreFocusOnUnmount() {
    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      onViewCase();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      tabIndex={-1}
      onKeyDownCapture={handleKeyDown}
      className="motion-safe:delay-75 motion-safe:page-enter fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 outline-none backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-[0_32px_72px_rgba(24,57,51,0.2)] outline-none"
      >
        <span
          aria-hidden="true"
          className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
          >
            <path d="M5 12l5 5 9-9" />
          </svg>
        </span>
        <h2 className="mt-4 text-xl font-bold text-ink">پرونده ثبت شد</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          شماره پرونده
          <span
            dir="ltr"
            className="mx-1.5 inline-flex items-baseline gap-1 font-mono font-semibold text-ink"
          >
            {createdCase.caseNumber}
          </span>
          ثبت شد.
        </p>
        <button
          type="button"
          onClick={onViewCase}
          className="motion-safe:transition-all motion-safe:duration-180 mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(13,123,132,0.22)] hover:bg-brand-strong hover:shadow-[0_8px_24px_rgba(13,123,132,0.28)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          مشاهده پرونده
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
            <path d="M14.5 7.5 16 9l1.5-1.5" />
            <path d="M16 16h5" />
            <path d="M16 16v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5" />
            <path d="M4 16h5" />
            <path d="M4 12h5" />
            <path d="M4 8h5" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export function CreateCasePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [createdCase, setCreatedCase] = useState<CreateCaseResponse | null>(
    null,
  );
  const search = useOrderSearch(submittedQuery);
  const selectedOrder =
    search.data?.results.find(
      (order) => order.id === selectedOrderId && order.eligibility.eligible,
    ) ?? null;

  const currentStep: Step = selectedOrder
    ? createdCase
      ? 'review'
      : 'items'
    : submittedQuery
      ? search.isFetching
        ? 'search'
        : 'items'
      : 'search';

  function handleQueryChange(value: string) {
    setQuery(value);

    if (validationError) {
      setValidationError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (search.isFetching) {
      return;
    }

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

  function handleCreated(createdCase: CreateCaseResponse) {
    setCreatedCase(createdCase);
  }

  function handleViewCase() {
    void navigate(`/cases/${createdCase!.id}`);
  }

  return (
    <main className="motion-safe:page-enter mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: 'ایجاد پرونده جدید' }]} />

      <header className="motion-safe:delay-100 motion-safe:page-enter mt-5 max-w-3xl">
        <span className="motion-safe:delay-75 motion-safe:item-enter inline-flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-1.5 text-[0.75rem] font-semibold text-brand-strong">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M15.05 14.95a5 5 0 1 1-3.95-3.95 5 5 0 0 1 3.95 3.95z" />
            <path d="M13 1h6v6h-6zM9 9L3 3l6-6 6 6-6 6Z" />
          </svg>
          اپراتور
        </span>
        <h1 className="mt-3 text-[1.625rem] leading-[1.55] font-bold text-ink sm:text-[1.875rem]">
          ساخت مغایرت جدید
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-7.5 text-muted sm:text-base sm:leading-8">
          سفارش مورد نظر را جست‌وجو کنید. فقط سفارش‌های تحویل‌شده با قلم
          تحویل‌شده قابل ثبت پرونده هستند.
        </p>
      </header>

      <StepIndicator currentStep={currentStep} />

      <div className="motion-safe:delay-150 motion-safe:page-enter mt-7 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-5">
        <OrderSearchForm
          query={query}
          error={validationError}
          isSubmitting={search.isFetching}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
        />

        <aside className="motion-safe:delay-100 motion-safe:item-enter rounded-3xl border border-line bg-surface/80 p-5 lg:p-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-xl bg-accent-soft text-accent"
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
              شرایط بررسی سفارش
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-[0.8125rem] leading-6 text-muted">
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
              />
              <span>سفارش باید وضعیت «تحویل نهایی شده» داشته باشد.</span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
              />
              <span>حداقل یک قلم با مقدار تحویل ثبت شده باشد.</span>
            </li>
          </ul>
        </aside>
      </div>

      <div
        aria-live="polite"
        className="motion-safe:delay-200 motion-safe:page-enter"
      >
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

      {!search.isFetching && selectedOrder && createdCase === null ? (
        <CaseItemsForm
          key={selectedOrder.id}
          order={selectedOrder}
          onChangeOrder={() => setSelectedOrderId(null)}
          onCreated={handleCreated}
        />
      ) : null}

      {createdCase ? (
        <SuccessState createdCase={createdCase} onViewCase={handleViewCase} />
      ) : null}
    </main>
  );
}

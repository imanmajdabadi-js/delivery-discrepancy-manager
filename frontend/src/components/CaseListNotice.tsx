import { Link } from 'react-router-dom';

interface CaseListNoticeProps {
  kind: 'initial-empty' | 'filtered-empty' | 'error';
  description?: string;
  onClear?: () => void;
  onRetry?: () => void;
}

export function CaseListNotice({
  kind,
  description,
  onClear,
  onRetry,
}: CaseListNoticeProps) {
  const isError = kind === 'error';
  const isFiltered = kind === 'filtered-empty';
  const title = isError
    ? 'فهرست پرونده‌ها دریافت نشد'
    : isFiltered
      ? 'نتیجه‌ای پیدا نشد'
      : 'هنوز پرونده‌ای ثبت نشده است';

  return (
    <section
      role={isError ? 'alert' : 'status'}
      className="surface-enter empty-state-card mt-6 rounded-3xl border border-dashed border-line bg-surface/95 px-5 py-11 text-center shadow-[0_12px_36px_rgba(24,57,51,0.05)] sm:px-8 sm:py-13"
    >
      <span
        aria-hidden="true"
        className={`mx-auto grid size-12 place-items-center rounded-2xl ${isError ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand'}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          {isError ? (
            <>
              <path d="M12 8v5" />
              <path d="M12 17h.01" />
              <path d="M10.3 4.3 3.6 16a2 2 0 0 0 1.7 3h13.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
            </>
          ) : isFiltered ? (
            <>
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 4 4M8 10.5h5" />
            </>
          ) : (
            <>
              <path d="M8 4h8M9 3v2m6-2v2" />
              <path d="M7 5h10a2 2 0 0 1 2 2v12H5V7a2 2 0 0 1 2-2Z" />
              <path d="M9 10h6m-6 4h4" />
            </>
          )}
        </svg>
      </span>
      <h2 className="mt-4 text-[1.0625rem] leading-7 font-semibold text-ink">
        {title}
      </h2>
      <p className="wrap-anywhere mx-auto mt-1.5 max-w-lg text-sm leading-7 text-muted sm:text-[0.9375rem]">
        {description ??
          (isFiltered
            ? 'شماره واردشده یا وضعیت انتخابی را تغییر دهید و دوباره بررسی کنید.'
            : 'با ثبت اولین مغایرت، پرونده آن در این بخش نمایش داده می‌شود.')}
      </p>

      {isError && onRetry ? (
        <button
          type="button"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition hover:border-brand-mild hover:bg-brand-soft/45 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={onRetry}
        >
          تلاش دوباره
        </button>
      ) : null}
      {isFiltered && onClear ? (
        <button
          type="button"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition hover:border-brand-mild hover:bg-brand-soft/45 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={onClear}
        >
          پاک‌کردن جست‌وجو و فیلتر
        </button>
      ) : null}
      {kind === 'initial-empty' ? (
        <Link
          to="/cases/new"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          ایجاد اولین پرونده
        </Link>
      ) : null}
    </section>
  );
}

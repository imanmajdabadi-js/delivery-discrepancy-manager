import { Link } from 'react-router-dom';

interface CaseDetailsNoticeProps {
  kind: 'not-found' | 'error';
  description: string;
  onRetry?: () => void;
}

export function CaseDetailsNotice({
  kind,
  description,
  onRetry,
}: CaseDetailsNoticeProps) {
  const isNotFound = kind === 'not-found';

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-18 lg:px-8">
      <section className="rounded-3xl border border-line bg-surface px-5 py-10 text-center shadow-[0_18px_55px_rgba(24,57,51,0.06)] sm:px-10 sm:py-14">
        <span
          aria-hidden="true"
          className={`mx-auto grid size-13 place-items-center rounded-2xl ${
            isNotFound
              ? 'bg-accent-violet-soft text-accent-violet'
              : 'bg-danger-soft text-danger'
          }`}
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
            {isNotFound ? (
              <>
                <path d="M8 4h8M9 3v2m6-2v2" />
                <path d="M7 5h10a2 2 0 0 1 2 2v12H5V7a2 2 0 0 1 2-2Z" />
                <path d="m9.5 10.5 5 5m0-5-5 5" />
              </>
            ) : (
              <>
                <path d="M12 8v5m0 3h.01" />
                <circle cx="12" cy="12" r="9" />
              </>
            )}
          </svg>
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink sm:text-2xl">
          {isNotFound ? 'پرونده پیدا نشد' : 'دریافت پرونده ممکن نشد'}
        </h1>
        <p className="wrap-anywhere mx-auto mt-2 max-w-lg text-sm leading-7 text-muted sm:text-[0.9375rem]">
          {description}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {!isNotFound && onRetry ? (
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={onRetry}
            >
              تلاش دوباره
            </button>
          ) : null}
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition hover:border-brand-mild hover:bg-brand-soft/35 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            بازگشت به پرونده‌ها
          </Link>
        </div>
      </section>
    </main>
  );
}

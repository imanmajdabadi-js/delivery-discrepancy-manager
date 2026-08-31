interface OrderSearchNoticeProps {
  kind: 'empty' | 'error';
  title: string;
  description: string;
  onRetry?: () => void;
}

export function OrderSearchNotice({
  kind,
  title,
  description,
  onRetry,
}: OrderSearchNoticeProps) {
  const isError = kind === 'error';

  return (
    <section
      role={isError ? 'alert' : 'status'}
      className="motion-safe:surface-enter empty-state-card mt-6 rounded-3xl border border-line bg-surface/95 px-5 py-9 text-center shadow-[0_12px_40px_rgba(24,57,51,0.05)] sm:px-8 sm:py-11"
    >
      <span
        aria-hidden="true"
        className={`mx-auto grid size-12 place-items-center rounded-2xl ${
          isError ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand'
        }`}
      >
        {isError ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
          >
            <path d="M12 8v5" />
            <path d="M12 17h.01" />
            <path d="M10.3 4.3 3.6 16a2 2 0 0 0 1.7 3h13.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 4 4M8 10.5h5" />
          </svg>
        )}
      </span>
      <h2 className="mt-4 text-[1.0625rem] leading-7 font-semibold text-ink">
        {title}
      </h2>
      <p className="wrap-anywhere mx-auto mt-1.5 max-w-lg text-sm leading-7 text-muted sm:text-[0.9375rem]">
        {description}
      </p>
      {onRetry ? (
        <button
          type="button"
          className="motion-safe:transition-colors motion-safe:duration-150 mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-brand-mild hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={onRetry}
        >
          تلاش دوباره
        </button>
      ) : null}
    </section>
  );
}

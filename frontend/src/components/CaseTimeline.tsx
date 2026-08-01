import type { CaseDetailsResponse } from '../types';
import { formatDateTime } from '../utils';
import { CaseStatusBadge } from './CaseStatusBadge';

export function CaseTimeline({
  history,
}: {
  history: CaseDetailsResponse['history'];
}) {
  return (
    <section
      aria-labelledby="case-timeline-title"
      className="rounded-3xl border border-line bg-surface p-5 shadow-[0_14px_42px_rgba(24,57,51,0.045)] sm:p-6"
    >
      <h2 id="case-timeline-title" className="text-base font-semibold text-ink">
        تاریخچه پرونده
      </h2>
      <p className="mt-1 text-[0.8125rem] leading-6 text-muted">
        رخدادها بر اساس زمان ثبت و بدون امکان ویرایش نمایش داده می‌شوند.
      </p>

      <ol className="mt-6 space-y-0">
        {history.map((event, index) => {
          const isLast = index === history.length - 1;
          const isCreated = event.eventType === 'CREATED';
          const isAssigned = event.eventType === 'ASSIGNED';
          const isReleased = event.eventType === 'ASSIGNMENT_RELEASED';

          const eventLabel = isCreated
            ? 'پرونده ایجاد شد'
            : isAssigned
              ? 'پرونده تخصیص یافت'
              : isReleased
                ? 'تخصیص پرونده آزاد شد'
                : 'تصمیم نهایی ثبت شد';

          return (
            <li key={event.id} className="relative flex gap-4 pb-7 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute top-8 right-3.75 bottom-0 w-px bg-line-strong"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative z-1 mt-1 grid size-8 shrink-0 place-items-center rounded-xl border ${
                  isCreated || isAssigned
                    ? 'border-brand-mild bg-brand-soft text-brand'
                    : isReleased
                      ? 'border-accent-amber/20 bg-accent-amber-soft text-accent-amber'
                      : 'border-accent-violet/20 bg-accent-violet-soft text-accent-violet'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  {isCreated ? (
                    <path d="M12 5v14M5 12h14" />
                  ) : isAssigned || isReleased ? (
                    <path d="M16 12h5m-5 0h5m-10 0h5M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                  ) : (
                    <path d="m5 12 4 4L19 6" />
                  )}
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-ink">
                    {eventLabel}
                  </h3>
                  <CaseStatusBadge status={event.resultingStatus} />
                </div>
                <p className="mt-2 text-[0.8125rem] leading-6 text-muted">
                  توسط {event.performedBy.fullName}
                </p>
                <time
                  dateTime={event.createdAt}
                  className="mt-1 block text-[0.75rem] text-subtle"
                >
                  {formatDateTime(event.createdAt)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

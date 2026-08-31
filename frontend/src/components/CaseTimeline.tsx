import { type ReactElement } from 'react';
import type { CaseDetailsResponse } from '../types';
import { formatDateTime } from '../utils';
import { CaseStatusBadge } from './CaseStatusBadge';

const eventIcons: Record<
  CaseDetailsResponse['history'][number]['eventType'],
  ReactElement
> = {
  CREATED: <path d="M12 5v14M5 12h14" />,
  ASSIGNED: (
    <path d="M16 12h5m-5 0h5m-10 0h5M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
  ),
  ASSIGNMENT_RELEASED: (
    <path d="M16 12V8a4 4 0 0 0-8 0v4m8 0v8H8v-8m8 0h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
  ),
  DECIDED: <path d="m5 12 4 4L19 6" />,
};

const eventLabels: Record<
  CaseDetailsResponse['history'][number]['eventType'],
  string
> = {
  CREATED: 'پرونده ایجاد شد',
  ASSIGNED: 'پرونده تخصیص یافت',
  ASSIGNMENT_RELEASED: 'تخصیص پرونده آزاد شد',
  DECIDED: 'تصمیم نهایی ثبت شد',
};

export function CaseTimeline({
  history,
}: {
  history: CaseDetailsResponse['history'];
}) {
  if (history.length === 0) {
    return (
      <section
        aria-label="بدون تاریخچه"
        className="rounded-3xl border border-line bg-surface/80 p-6 text-center shadow-[0_14px_42px_rgba(24,57,51,0.045)] sm:p-8"
      >
        <p className="text-sm text-muted">هیچ رویدادی ثبت نشده است.</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="case-timeline-title"
      className="rounded-3xl border border-line bg-surface/80 p-5 shadow-[0_14px_42px_rgba(24,57,51,0.045)] sm:p-6"
    >
      <h2
        id="case-timeline-title"
        className="flex items-center gap-2.5 text-base font-semibold text-ink"
      >
        <span
          aria-hidden="true"
          className="grid size-5.5 place-items-center rounded-lg bg-brand-soft text-brand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-3"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5m0-8h.01" />
          </svg>
        </span>
        تاریخچه عملیات
      </h2>
      <p className="mt-1 text-[0.8125rem] leading-6 text-muted">
        رویدادهای ثبت‌شده بر اساس زمان، بدون امکان ویرایش.
      </p>

      <ol
        className="mountain-steps mt-6 space-y-0"
        role="list"
        aria-label="جریان عملیاتی"
      >
        {history.map((event, index) => {
          const isLast = index === history.length - 1;
          const eventType = event.eventType;
          const eventLabel = eventLabels[eventType];
          const icon = eventIcons[eventType];

          const isStart = eventType === 'CREATED';
          const isDecision = eventType === 'DECIDED';

          const nodeColor = isStart
            ? 'border-brand bg-brand-soft text-brand'
            : isDecision
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-brand-mild bg-brand-soft/60 text-brand';

          const lineColor = isStart
            ? 'bg-brand'
            : isDecision
              ? 'bg-accent'
              : 'bg-brand-mild';

          return (
            <li key={event.id} className="relative flex gap-4 pb-7 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={`absolute top-[32px] right-[15px] bottom-0 w-px ${lineColor} motion-safe:duration-300`}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative z-1 mt-1 grid size-8 shrink-0 place-items-center rounded-xl border ${nodeColor} motion-safe:transition-transform motion-safe:duration-300`}
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
                  {icon}
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
                  توسط{' '}
                  <span className="font-medium text-ink">
                    {event.performedBy.fullName}
                  </span>
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

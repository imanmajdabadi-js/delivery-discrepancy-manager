import { type ReactElement } from 'react';
import type { CaseStatus } from '../types';

const statusDetails: Record<CaseStatus, { label: string; icon: ReactElement }> =
  {
    SUBMITTED: {
      label: 'ثبت‌شده',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M8 4h8M9 3v2m6-2v2M7 5h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        </svg>
      ),
    },
    APPROVED: {
      label: 'تأییدشده',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M5 12l5 5 9-9" />
        </svg>
      ),
    },
    REJECTED: {
      label: 'ردشده',
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ),
    },
  };

const statusStyles: Record<CaseStatus, string> = {
  SUBMITTED: 'border-warning/20 bg-warning-soft text-warning-strong',
  APPROVED: 'border-success/20 bg-success-soft text-success-strong',
  REJECTED: 'border-danger/20 bg-danger-soft text-danger-strong',
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const details = statusDetails[status];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.8125rem] font-semibold tracking-wide ${statusStyles[status]}`}
    >
      {details.icon}
      {details.label}
    </span>
  );
}

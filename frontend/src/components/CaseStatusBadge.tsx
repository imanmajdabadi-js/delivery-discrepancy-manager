import type { CaseStatus } from '../types';

const statusDetails: Record<CaseStatus, { label: string; className: string }> =
  {
    SUBMITTED: {
      label: 'ثبت‌شده',
      className: 'bg-warning-soft text-warning-strong',
    },
    APPROVED: {
      label: 'تأییدشده',
      className: 'bg-success-soft text-success-strong',
    },
    REJECTED: {
      label: 'ردشده',
      className: 'bg-danger-soft text-danger-strong',
    },
  };

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const details = statusDetails[status];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold ${details.className}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {details.label}
    </span>
  );
}

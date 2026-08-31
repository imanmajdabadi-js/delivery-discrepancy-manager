import type { CaseStatus } from '../types';
import { useQuery } from '@tanstack/react-query';
import { getCaseStats } from '../services';
import { toPersianDigits } from '../utils';
import { CaseStatusBadge } from './CaseStatusBadge';

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_6px_20px_rgba(24,57,51,0.04)] sm:p-5">
      <div className="h-4 w-20 rounded-full bg-line/60" />
      <div className="mt-2 h-6 w-8 rounded bg-line/80 text-2xl font-black" />
    </div>
  );
}

export function CaseStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['case-stats'],
    queryFn: ({ signal }) => getCaseStats(signal),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats: Array<{
    label: string;
    value: number;
    badge?: CaseStatus;
  }> = [
    { label: 'کل پرونده‌ها', value: data.total },
    { label: 'در انتظار بررسی', value: data.submitted, badge: 'SUBMITTED' },
    { label: 'تأیید شده', value: data.approved, badge: 'APPROVED' },
    { label: 'رد شده', value: data.rejected, badge: 'REJECTED' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-line bg-surface p-4 shadow-[0_6px_20px_rgba(24,57,51,0.04)] sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.8125rem] font-medium text-muted">
              {stat.label}
            </span>
            {stat.badge ? <CaseStatusBadge status={stat.badge} /> : null}
          </div>
          <span className="mt-2 block text-2xl font-black text-ink">
            {toPersianDigits(stat.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

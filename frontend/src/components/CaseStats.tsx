import { useQuery } from '@tanstack/react-query';
import { getCaseStats } from '../services';
import { toPersianDigits } from '../utils';

export function CaseStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['case-stats'],
    queryFn: ({ signal }) => getCaseStats(signal),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-line/60 bg-surface-soft/80"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'کل پرونده‌ها',
      value: data.total,
      color: 'text-accent-indigo',
      bg: 'bg-accent-indigo-soft/50',
      border: 'border-accent-indigo/20',
    },
    {
      label: 'در انتظار بررسی',
      value: data.submitted,
      color: 'text-brand-strong',
      bg: 'bg-brand-soft/50',
      border: 'border-brand/20',
    },
    {
      label: 'تأیید شده',
      value: data.approved,
      color: 'text-success-strong',
      bg: 'bg-success-soft/50',
      border: 'border-success/20',
    },
    {
      label: 'رد شده',
      value: data.rejected,
      color: 'text-danger-strong',
      bg: 'bg-danger-soft/50',
      border: 'border-danger/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border ${card.border} ${card.bg} p-4 shadow-[0_10px_25px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
        >
          <span className="block text-[0.8125rem] font-medium text-muted">
            {card.label}
          </span>
          <span className={`mt-2 block text-2xl font-black ${card.color}`}>
            {toPersianDigits(card.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

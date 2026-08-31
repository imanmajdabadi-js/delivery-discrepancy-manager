import type { CaseDetailsResponse } from '../types';
import { formatDateTime } from '../utils';

export function CaseDecisionSummary({
  decision,
}: {
  decision: NonNullable<CaseDetailsResponse['decision']>;
}) {
  const isApproved = decision.type === 'APPROVE';

  return (
    <section
      aria-labelledby="case-decision-title"
      className={`motion-safe:delay-75 motion-safe:page-enter rounded-3xl border p-5 sm:p-6 ${
        isApproved
          ? 'border-success/20 bg-success-soft/55'
          : 'border-danger/20 bg-danger-soft/55'
      }`}
    >
      <p
        className={`text-[0.75rem] font-semibold ${
          isApproved ? 'text-success-strong' : 'text-danger-strong'
        }`}
      >
        نتیجه نهایی
      </p>
      <h2 id="case-decision-title" className="mt-1 text-lg font-bold text-ink">
        {isApproved ? 'پرونده تأیید شده است' : 'پرونده رد شده است'}
      </h2>
      <p className="wrap-anywhere mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
        {decision.explanation}
      </p>
      <p className="mt-4 border-t border-current/10 pt-3 text-[0.75rem] leading-6 text-subtle">
        {decision.decidedBy.fullName}، {formatDateTime(decision.createdAt)}
      </p>
    </section>
  );
}

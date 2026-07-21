import type { CaseDetailsResponse } from '../types';
import { formatDateTime, formatPhoneNumber } from '../utils';

function SummaryRow({
  label,
  value,
  direction,
}: {
  label: string;
  value: string;
  direction?: 'ltr';
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-0 last:pb-0">
      <dt className="shrink-0 text-[0.75rem] font-semibold text-subtle">
        {label}
      </dt>
      <dd
        dir={direction}
        className="text-left text-sm leading-6 font-semibold text-ink"
      >
        {value}
      </dd>
    </div>
  );
}

export function CaseDetailsSummary({
  caseDetails,
}: {
  caseDetails: CaseDetailsResponse;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <section
        aria-labelledby="customer-summary-title"
        className="rounded-3xl border border-line bg-surface p-5 shadow-[0_12px_38px_rgba(24,57,51,0.045)]"
      >
        <h2
          id="customer-summary-title"
          className="text-sm font-semibold text-ink"
        >
          اطلاعات مشتری
        </h2>
        <dl className="mt-3">
          <SummaryRow
            label="نام مشتری"
            value={caseDetails.order.customer.fullName}
          />
          <SummaryRow
            label="کد مشتری"
            value={caseDetails.order.customer.customerCode}
            direction="ltr"
          />
          <SummaryRow
            label="شماره موبایل"
            value={formatPhoneNumber(caseDetails.order.customer.phone)}
            direction="ltr"
          />
        </dl>
      </section>

      <section
        aria-labelledby="order-summary-title"
        className="rounded-3xl border border-line bg-surface p-5 shadow-[0_12px_38px_rgba(24,57,51,0.045)]"
      >
        <h2 id="order-summary-title" className="text-sm font-semibold text-ink">
          اطلاعات سفارش
        </h2>
        <dl className="mt-3">
          <SummaryRow
            label="شماره سفارش"
            value={caseDetails.order.orderNumber}
            direction="ltr"
          />
          <SummaryRow
            label="زمان تحویل"
            value={
              caseDetails.order.deliveredAt
                ? formatDateTime(caseDetails.order.deliveredAt)
                : 'ثبت نشده'
            }
          />
          <SummaryRow
            label="ایجادکننده"
            value={caseDetails.createdBy.fullName}
          />
        </dl>
      </section>
    </aside>
  );
}

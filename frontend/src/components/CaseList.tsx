import { Link } from 'react-router-dom';
import type { CaseListItem } from '../types';
import { formatDateTime, toPersianDigits } from '../utils';
import { CaseStatusBadge } from './CaseStatusBadge';

function CaseLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function CaseList({ cases }: { cases: CaseListItem[] }) {
  return (
    <section aria-label="فهرست پرونده‌ها" className="mt-5">
      <div className="space-y-3 lg:hidden">
        {cases.map((caseItem) => (
          <Link
            key={caseItem.id}
            to={`/cases/${caseItem.id}`}
            className="group block rounded-2xl border border-line bg-surface p-4 shadow-[0_8px_26px_rgba(24,57,51,0.045)] transition hover:border-brand-mild hover:shadow-[0_12px_32px_rgba(24,57,51,0.08)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted">شماره پرونده</p>
                <p
                  dir="ltr"
                  className="wrap-anywhere mt-1 text-right text-base font-bold text-ink"
                >
                  {caseItem.caseNumber}
                </p>
              </div>
              <CaseStatusBadge status={caseItem.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-muted">مشتری</p>
                <p className="wrap-anywhere mt-1 font-semibold text-ink">
                  {caseItem.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">شماره سفارش</p>
                <p
                  dir="ltr"
                  className="wrap-anywhere mt-1 text-right font-medium text-ink"
                >
                  {caseItem.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">اقلام مغایرت</p>
                <p className="mt-1 font-medium text-ink">
                  {toPersianDigits(caseItem.itemCount)} قلم
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">زمان ثبت</p>
                <time
                  className="mt-1 block font-medium text-ink"
                  dateTime={caseItem.createdAt}
                >
                  {formatDateTime(caseItem.createdAt)}
                </time>
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:text-brand-strong">
              مشاهده پرونده
              <CaseLinkIcon />
            </span>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_10px_35px_rgba(24,57,51,0.05)] lg:block">
        <table className="w-full table-fixed border-collapse text-right">
          <thead className="border-b border-line bg-surface-soft text-[0.8125rem] font-semibold text-muted">
            <tr>
              <th scope="col" className="w-[16%] px-5 py-4">
                شماره پرونده
              </th>
              <th scope="col" className="w-[24%] px-5 py-4">
                مشتری و سفارش
              </th>
              <th scope="col" className="w-[13%] px-5 py-4">
                تعداد اقلام
              </th>
              <th scope="col" className="w-[15%] px-5 py-4">
                وضعیت
              </th>
              <th scope="col" className="w-[22%] px-5 py-4">
                زمان ثبت
              </th>
              <th scope="col" className="w-[10%] px-5 py-4">
                <span className="sr-only">عملیات</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cases.map((caseItem) => (
              <tr
                key={caseItem.id}
                className="transition hover:bg-brand-soft/20"
              >
                <td className="px-5 py-4">
                  <Link
                    dir="ltr"
                    to={`/cases/${caseItem.id}`}
                    className="wrap-anywhere inline-block rounded-md text-sm font-bold text-ink transition hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
                  >
                    {caseItem.caseNumber}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <p className="wrap-anywhere text-sm leading-6 font-semibold text-ink">
                    {caseItem.customerName}
                  </p>
                  <p
                    dir="ltr"
                    className="wrap-anywhere mt-1 text-right text-xs text-muted"
                  >
                    {caseItem.orderNumber}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-ink">
                  {toPersianDigits(caseItem.itemCount)} قلم
                </td>
                <td className="px-5 py-4">
                  <CaseStatusBadge status={caseItem.status} />
                </td>
                <td className="px-5 py-4 text-sm text-muted">
                  <time dateTime={caseItem.createdAt}>
                    {formatDateTime(caseItem.createdAt)}
                  </time>
                </td>
                <td className="px-5 py-4">
                  <Link
                    to={`/cases/${caseItem.id}`}
                    aria-label={`مشاهده پرونده ${caseItem.caseNumber}`}
                    className="inline-flex size-9 items-center justify-center rounded-xl text-brand transition hover:bg-brand-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <CaseLinkIcon />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

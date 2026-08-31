import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { CaseAssignmentControls } from '../../../components/CaseAssignmentControls';
import { CaseDecisionSummary } from '../../../components/CaseDecisionSummary';
import { CaseDecisionForm } from '../../../components/CaseDecisionForm';
import { CaseDetailsNotice } from '../../../components/CaseDetailsNotice';
import { CaseDetailsSkeleton } from '../../../components/CaseDetailsSkeleton';
import { CaseDetailsSummary } from '../../../components/CaseDetailsSummary';
import { CaseDiscrepancyList } from '../../../components/CaseDiscrepancyList';
import { CaseStatusBadge } from '../../../components/CaseStatusBadge';
import { CaseTimeline } from '../../../components/CaseTimeline';
import { useCaseDetails } from '../../../hooks/useCaseDetails';
import { ApiError } from '../../../services';
import { getUserRole } from '../../../utils';
import { formatDateTime } from '../../../utils';

export function CaseDetailsPage() {
  const { id } = useParams();
  const caseDetailsQuery = useCaseDetails(id ?? null);

  if (caseDetailsQuery.isPending) {
    return <CaseDetailsSkeleton />;
  }

  if (caseDetailsQuery.isError) {
    const isNotFound =
      caseDetailsQuery.error instanceof ApiError &&
      caseDetailsQuery.error.status === 404;

    return (
      <CaseDetailsNotice
        kind={isNotFound ? 'not-found' : 'error'}
        description={
          isNotFound
            ? 'شناسه واردشده به پرونده معتبری متصل نیست. از فهرست پرونده‌ها مسیر درست را دوباره انتخاب کنید.'
            : caseDetailsQuery.error instanceof ApiError
              ? caseDetailsQuery.error.message
              : 'ارتباط با سامانه برقرار نشد. اتصال را بررسی کنید و دوباره تلاش کنید.'
        }
        onRetry={() => void caseDetailsQuery.refetch()}
      />
    );
  }

  const caseDetails = caseDetailsQuery.data;
  const userRole = getUserRole();

  return (
    <main className="motion-safe:page-enter mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs
        items={[
          {
            label: `پرونده ${caseDetails.caseNumber}`,
          },
        ]}
      />

      <header className="case-detail-hero motion-safe:delay-75 motion-safe:page-enter relative mt-5 overflow-hidden rounded-3xl border border-brand-mild/30 px-5 py-6 shadow-[0_18px_58px_rgba(24,57,51,0.07)] sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px), radial-gradient(circle at 50% 30%, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.75rem] font-semibold text-brand">
                شماره پرونده
              </p>
              <h1
                dir="ltr"
                className="wrap-anywhere mt-1 text-left text-2xl font-bold tracking-[0.035em] text-ink sm:text-[1.75rem]"
              >
                {caseDetails.caseNumber}
              </h1>
              <p className="mt-2 text-[0.9375rem] leading-7.5 text-muted">
                مغایرت ثبت‌شده برای سفارش{' '}
                <span dir="ltr" className="font-semibold text-ink">
                  {caseDetails.order.orderNumber}
                </span>
              </p>
            </div>
            <div className="motion-safe:delay-100 motion-safe:item-enter">
              <CaseStatusBadge status={caseDetails.status} />
            </div>
          </div>

          <dl className="motion-safe:delay-150 motion-safe:page-enter mt-6 grid gap-3 border-t border-brand-mild/30 pt-5 text-[0.8125rem] sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="font-semibold text-subtle">زمان ایجاد:</dt>
              <dd className="text-muted">
                {formatDateTime(caseDetails.createdAt)}
              </dd>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="font-semibold text-subtle">ثبت‌کننده:</dt>
              <dd className="wrap-anywhere min-w-0 text-muted">
                {caseDetails.createdBy.fullName}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <CaseAssignmentControls caseDetails={caseDetails} />

      <div className="motion-safe:delay-200 motion-safe:page-enter mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          {caseDetails.decision ? (
            <CaseDecisionSummary decision={caseDetails.decision} />
          ) : caseDetails.status === 'SUBMITTED' && userRole === 'MANAGER' ? (
            <CaseDecisionForm caseId={caseDetails.id} />
          ) : null}
          <CaseDiscrepancyList items={caseDetails.items} />
          <CaseTimeline history={caseDetails.history} />
        </div>
        <CaseDetailsSummary caseDetails={caseDetails} />
      </div>
    </main>
  );
}

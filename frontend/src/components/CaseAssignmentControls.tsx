import { useCaseAssignment } from '../hooks/useCaseAssignment';
import { ApiError } from '../services';
import type { CaseDetailsResponse } from '../types';
import { getCurrentUserId, formatDateTime, getUserRole } from '../utils';

interface CaseAssignmentControlsProps {
  caseDetails: CaseDetailsResponse;
};

export function CaseAssignmentControls({ caseDetails }: CaseAssignmentControlsProps) {
  const userRole = getUserRole();
  const currentUserId = getCurrentUserId();
  const { claim, release } = useCaseAssignment();

  const isAssignable = caseDetails.status === 'SUBMITTED';
  const isAssigned = caseDetails.assigneeId !== null;
  const isCurrentUserAssignee = caseDetails.assigneeId === currentUserId;
  const showControls = userRole === 'OPERATOR' && isAssignable;
  const canClaim = showControls && !isAssigned;
  const canRelease = showControls && isAssigned && isCurrentUserAssignee;

  if (!showControls) {
    return null;
  }

  function handleClaim() {
    if (claim.isPending) {
      return;
    }

    claim.mutate(caseDetails.id);
  }

  function handleRelease() {
    if (release.isPending) {
      return;
    }

    release.mutate(caseDetails.id);
  }

  const claimError = claim.isError
    ? claim.error instanceof ApiError
      ? claim.error.message
      : 'اختصاص پرونده انجام نشد. دوباره تلاش کنید.'
    : null;

  const releaseError = release.isError
    ? release.error instanceof ApiError
      ? release.error.message
      : 'آزادسازی پرونده انجام نشد. دوباره تلاش کنید.'
    : null;

  return (
    <section
      aria-labelledby="case-assignment-title"
      aria-busy={claim.isPending || release.isPending}
      className="rounded-3xl border border-line bg-surface p-6 shadow-[0_14px_42px_rgba(24,57,51,0.045)] sm:p-7"
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M16 12h5M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
            <path d="M8 12l2 2 4-4" />
          </svg>
        </span>
        <div className="flex-1">
          <h2
            id="case-assignment-title"
            className="text-base font-semibold text-ink"
          >
            تخصیص پرونده
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-6 text-muted">
            {isAssigned ? (
              <>
                به{' '}
                <span className="font-semibold text-ink">
                  {caseDetails.assignee?.fullName ?? '---'}
                </span>{' '}
                اختصاص یافته
                {caseDetails.assignedAt
                  ? ` در ${formatDateTime(caseDetails.assignedAt)}`
                  : null}
              </>
            ) : (
              'این پرونده در انتظار دریافت است.'
            )}
          </p>
        </div>
      </div>

      <div aria-live="polite" className="mt-4 min-h-6">
        {claimError ? (
          <p
            role="alert"
            className="wrap-anywhere text-sm leading-6 text-danger"
          >
            {claimError}
          </p>
        ) : null}
        {releaseError ? (
          <p
            role="alert"
            className="wrap-anywhere text-sm leading-6 text-danger"
          >
            {releaseError}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {canClaim ? (
          <button
            type="button"
            disabled={claim.isPending || release.isPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,118,110,0.18)] transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-65 sm:w-auto sm:flex-1"
            onClick={handleClaim}
          >
            {claim.isPending ? 'در حال درخواست...' : 'درخواست انتساب'}
          </button>
        ) : null}
        {canRelease ? (
          <button
            type="button"
            disabled={claim.isPending || release.isPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand-mild bg-surface px-4 text-sm font-semibold text-brand-strong transition hover:bg-brand-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-65 sm:w-auto sm:flex-1"
            onClick={handleRelease}
          >
            {release.isPending ? 'در حال آزادسازی...' : 'آزادسازی انتساب'}
          </button>
        ) : null}
      </div>
    </section>
  );
}

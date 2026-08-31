import { useRef, useState } from 'react';
import { useCaseDecision } from '../hooks/useCaseDecision';
import { ApiError } from '../services';
import type { CaseDecisionType } from '../types';

interface CaseDecisionFormProps {
  caseId: string;
}

export function CaseDecisionForm({ caseId }: CaseDecisionFormProps) {
  const [explanation, setExplanation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittingType, setSubmittingType] = useState<CaseDecisionType | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const explanationRef = useRef<HTMLTextAreaElement>(null);
  const decisionMutation = useCaseDecision(caseId);

  function handleExplanationChange(value: string) {
    setExplanation(value);

    if (validationError) {
      setValidationError(null);
    }

    if (successMessage) {
      setSuccessMessage(null);
    }

    if (decisionMutation.isError) {
      decisionMutation.reset();
    }
  }

  function handleDecision(type: CaseDecisionType) {
    if (decisionMutation.isPending) {
      return;
    }

    const trimmedExplanation = explanation.trim();

    if (!trimmedExplanation) {
      setValidationError('پیش از ثبت نتیجه، توضیح تصمیم را وارد کنید.');
      explanationRef.current?.focus();
      return;
    }

    setValidationError(null);
    setSuccessMessage(null);
    setSubmittingType(type);
    decisionMutation.mutate(
      { type, explanation: trimmedExplanation },
      {
        onSuccess: () => {
          setSuccessMessage(
            type === 'APPROVE'
              ? 'پرونده با موفقیت تأیید شد.'
              : 'پرونده با موفقیت رد شد.',
          );
        },
        onSettled: () => setSubmittingType(null),
      },
    );
  }

  const requestError = decisionMutation.isError
    ? decisionMutation.error instanceof ApiError
      ? decisionMutation.error.message
      : 'پاسخ ثبت تصمیم دریافت نشد. اطلاعات پرونده دوباره بررسی می‌شود و توضیح شما حفظ شده است.'
    : null;

  return (
    <section
      aria-labelledby="case-decision-form-title"
      aria-busy={decisionMutation.isPending}
      className="rounded-3xl border border-line bg-surface p-6 shadow-[0_14px_42px_rgba(24,57,51,0.045)] sm:p-7"
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"
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
            <path d="M9 11.5 11 14l4-5" />
            <path d="M7 4h10a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Z" />
          </svg>
        </span>
        <div>
          <h2
            id="case-decision-form-title"
            className="text-base font-semibold text-ink"
          >
            ثبت نتیجه رسیدگی
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-6 text-muted">
            نتیجه نهایی است و پس از ثبت امکان تغییر آن وجود ندارد.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block" htmlFor="case-decision-explanation">
          <span className="text-sm font-semibold text-ink">توضیح تصمیم</span>
          <span aria-hidden="true" className="mr-1 text-xs text-danger">
            الزامی
          </span>
        </label>
        <textarea
          ref={explanationRef}
          id="case-decision-explanation"
          value={explanation}
          rows={4}
          disabled={decisionMutation.isPending}
          placeholder="دلیل تأیید یا رد پرونده را کوتاه و روشن بنویسید."
          aria-invalid={validationError ? true : undefined}
          aria-describedby={
            validationError ? 'case-decision-validation-error' : undefined
          }
          className="mt-2 w-full resize-y rounded-2xl border border-line-strong bg-surface px-4 py-3 text-[0.9375rem] leading-7 text-ink outline-none transition placeholder:text-muted/75 focus:border-brand focus:ring-3 focus:ring-brand-soft disabled:cursor-wait disabled:bg-surface-soft"
          onChange={(event) => handleExplanationChange(event.target.value)}
        />

        <div aria-live="polite" className="mt-2.5 min-h-6">
          {successMessage && !decisionMutation.isError ? (
            <p
              role="status"
              className="wrap-anywhere text-sm leading-6 text-success-strong"
            >
              {successMessage}
            </p>
          ) : validationError ? (
            <p
              id="case-decision-validation-error"
              className="wrap-anywhere text-sm text-danger"
            >
              {validationError}
            </p>
          ) : requestError ? (
            <p
              role="alert"
              className="wrap-anywhere text-sm leading-6 text-danger"
            >
              {requestError}
            </p>
          ) : (
            <p className="text-xs leading-6 text-muted">
              توضیح ثبت‌شده همراه پرونده و نام تصمیم‌گیرنده نگه‌داری می‌شود.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={decisionMutation.isPending}
          className="motion-safe:transition-all motion-safe:duration-180 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white hover:bg-success-strong hover:shadow-[0_8px_22px_rgba(16,150,66,0.22)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-success disabled:cursor-wait disabled:opacity-60"
          onClick={() => handleDecision('APPROVE')}
        >
          {submittingType === 'APPROVE' && decisionMutation.isPending ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4 animate-spin"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 17l4-4-4-4" />
            </svg>
          ) : null}
          {submittingType === 'APPROVE' ? 'در حال ثبت...' : 'تأیید و اتمام'}
        </button>
        <button
          type="button"
          disabled={decisionMutation.isPending}
          className="motion-safe:transition-all motion-safe:duration-180 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-surface px-4 text-sm font-semibold text-danger-strong hover:border-danger/50 hover:bg-danger-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-wait disabled:opacity-60"
          onClick={() => handleDecision('REJECT')}
        >
          {submittingType === 'REJECT' ? 'در حال ثبت...' : 'رد و انتقال'}
        </button>
      </div>
    </section>
  );
}

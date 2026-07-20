import { Link } from 'react-router-dom';
import type { CreateCaseResponse } from '../types';
import { toPersianDigits } from '../utils';

interface CaseCreationSuccessProps {
  createdCase: CreateCaseResponse;
  itemCount: number;
  onCreateAnother: () => void;
}

export function CaseCreationSuccess({
  createdCase,
  itemCount,
  onCreateAnother,
}: CaseCreationSuccessProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-success/20 bg-surface shadow-[0_20px_65px_rgba(24,57,51,0.08)]">
        <div className="success-receipt px-5 py-8 text-center sm:px-9 sm:py-10">
          <span
            aria-hidden="true"
            className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-soft text-success"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>
          <p className="mt-4 text-sm font-semibold text-success-strong">
            پرونده با موفقیت ثبت شد
          </p>
          <h1
            dir="ltr"
            className="mt-2 text-2xl font-bold tracking-[0.03em] text-ink sm:text-[1.75rem]"
          >
            {createdCase.caseNumber}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
            پرونده با {toPersianDigits(itemCount)} ردیف مغایرت در وضعیت ثبت‌شده
            قرار گرفت و آماده رسیدگی است.
          </p>
        </div>

        <div className="grid gap-3 border-t border-line bg-surface-soft px-5 py-5 sm:grid-cols-2 sm:px-8">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={onCreateAnother}
          >
            ثبت پرونده دیگر
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition hover:border-brand-mild hover:bg-brand-soft/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            بازگشت به پرونده‌ها
          </Link>
        </div>
      </section>
    </main>
  );
}

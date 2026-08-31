import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { validateCaseItems } from '../features/cases/utils/validation';
import { useCreateCase } from '../hooks/useCreateCase';
import { ApiError } from '../services';
import {
  formatPhoneNumber,
  normalizeSearchQuery,
  toPersianDigits,
} from '../utils';
import type {
  CaseConflict,
  CaseDiscrepancyType,
  CreateCaseResponse,
  OrderSearchResult,
} from '../types';
import { CaseItemEditor } from './CaseItemEditor';

type ItemDrafts = Record<string, Partial<Record<CaseDiscrepancyType, string>>>;

const discrepancyTypes: CaseDiscrepancyType[] = ['SHORTAGE', 'DAMAGED'];

interface CaseItemsFormProps {
  order: OrderSearchResult;
  onChangeOrder: () => void;
  onCreated: (createdCase: CreateCaseResponse) => void;
}

function hasSelectedType(
  draft: Partial<Record<CaseDiscrepancyType, string>>,
  type: CaseDiscrepancyType,
) {
  return Object.prototype.hasOwnProperty.call(draft, type);
}

export function CaseItemsForm({
  order,
  onChangeOrder,
  onCreated,
}: CaseItemsFormProps) {
  const [drafts, setDrafts] = useState<ItemDrafts>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<CaseConflict[] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const createCaseMutation = useCreateCase();

  const selectedEntries = useMemo(
    () =>
      order.items.flatMap((item) =>
        discrepancyTypes.flatMap((type) =>
          hasSelectedType(drafts[item.id] ?? {}, type)
            ? [{ item, type, value: drafts[item.id]?.[type] ?? '' }]
            : [],
        ),
      ),
    [drafts, order.items],
  );
  const selectedProductCount = new Set(
    selectedEntries.map((entry) => entry.item.id),
  ).size;

  function resetFeedback() {
    setErrors({});
    setSubmitError(null);
    setConflicts(null);
    createCaseMutation.reset();
  }

  function focusFirstProblem(fallbackToFirstType = false) {
    requestAnimationFrame(() => {
      const invalidField = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      const firstTypeButton = fallbackToFirstType
        ? formRef.current?.querySelector<HTMLElement>(
            '[data-discrepancy-toggle]',
          )
        : null;

      (invalidField ?? firstTypeButton)?.focus();
    });
  }

  function handleToggle(itemId: string, type: CaseDiscrepancyType) {
    resetFeedback();
    setDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      const itemDraft = { ...nextDrafts[itemId] };

      if (hasSelectedType(itemDraft, type)) {
        delete itemDraft[type];
      } else {
        itemDraft[type] = '';
      }

      if (Object.keys(itemDraft).length === 0) {
        delete nextDrafts[itemId];
      } else {
        nextDrafts[itemId] = itemDraft;
      }

      return nextDrafts;
    });
  }

  function handleQuantityChange(
    itemId: string,
    type: CaseDiscrepancyType,
    value: string,
  ) {
    resetFeedback();
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [itemId]: {
        ...currentDrafts[itemId],
        [type]: normalizeSearchQuery(value),
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createCaseMutation.isPending) {
      return;
    }

    const { requestItems, errors: nextErrors } = validateCaseItems(
      order,
      selectedEntries,
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError('موارد مشخص‌شده را اصلاح کنید.');
      focusFirstProblem(Boolean(nextErrors.form));
      return;
    }

    setErrors({});
    setSubmitError(null);

    try {
      const createdCase = await createCaseMutation.mutateAsync({
        orderId: order.id,
        items: requestItems,
      });
      onCreated(createdCase);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.payload?.conflicts) {
        setConflicts(error.payload.conflicts);
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('ثبت پرونده با خطا روبه‌رو شد. دوباره تلاش کنید.');
      }
    }
  }

  return (
    <section
      aria-labelledby="case-items-title"
      className="motion-safe:delay-250 motion-safe:page-enter mt-8"
    >
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-[0_18px_50px_rgba(24,57,51,0.06)] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.75rem] font-semibold text-muted">
              سفارش انتخاب‌شده
            </p>
            <h2
              id="case-items-title"
              dir="ltr"
              className="mt-1 text-left text-lg font-bold text-ink sm:text-xl"
            >
              {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-muted">{order.customer.fullName}</p>
          </div>
          <button
            type="button"
            disabled={createCaseMutation.isPending}
            onClick={onChangeOrder}
            className="motion-safe:transition-all motion-safe:duration-150 inline-flex h-10 items-center justify-center self-start rounded-xl border border-brand-mild bg-brand-soft px-4 text-sm font-semibold text-brand-strong hover:bg-brand-mild/50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1.5 size-4"
            >
              <path d="M16 3.5V6h4v4h-2.5M4 20h16v-2.5a2.5 2.5 0 0 0-2.5-2.5H7a2.5 2.5 0 0 1-2.5-2.5V7a2.5 2.5 0 0 1 2.5-2.5h8" />
            </svg>
            تغییر سفارش
          </button>
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-line bg-surface-soft/70 p-4 sm:grid-cols-3 sm:p-5">
          <div className="sm:col-span-2 min-w-0">
            <p className="text-[0.75rem] font-semibold text-subtle">مشتری</p>
            <p className="wrap-anywhere mt-1 text-sm font-semibold text-ink">
              {order.customer.fullName}
            </p>
          </div>
          <div>
            <p className="text-[0.75rem] font-semibold text-subtle">کد مشتری</p>
            <p
              dir="ltr"
              className="wrap-anywhere mt-1 text-left text-sm font-medium text-ink"
            >
              {order.customer.customerCode}
            </p>
          </div>
          <div>
            <p className="text-[0.75rem] font-semibold text-subtle">
              شماره موبایل
            </p>
            <p
              dir="ltr"
              className="mt-1 text-left text-sm font-medium text-ink"
            >
              {formatPhoneNumber(order.customer.phone)}
            </p>
          </div>
          <div>
            <p className="text-[0.75rem] font-semibold text-subtle">
              تعداد اقلام
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {toPersianDigits(order.items.length)} قلم
            </p>
          </div>
        </div>

        <form
          ref={formRef}
          aria-busy={createCaseMutation.isPending}
          className="motion-safe:surface-enter relative mt-6"
          noValidate
          onSubmit={handleSubmit}
        >
          {createCaseMutation.isPending ? (
            <div
              aria-label="در حال ثبت پرونده"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface/90 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-brand">
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-brand-mild/60 border-t-brand motion-reduce:animate-none"
                />
                در حال ثبت پرونده
              </span>
            </div>
          ) : null}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-7">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    اقلام دارای مغایرت
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-muted">
                    برای هر قلم، کسری یا آسیب‌دیدگی را انتخاب و مقدار آن را وارد
                    کنید.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[0.8125rem] font-semibold text-brand-strong">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-brand"
                  />
                  {toPersianDigits(selectedProductCount)} قلم
                </span>
              </div>

              <ul className="space-y-3.5">
                {order.items.map((item, index) => (
                  <li
                    key={item.id}
                    className="motion-safe:[animation-delay:var(--delay)] motion-safe:item-enter"
                    style={
                      {
                        '--delay': `${Math.min(index * 45, 300)}ms`,
                      } as CSSProperties
                    }
                  >
                    <CaseItemEditor
                      item={item}
                      quantities={drafts[item.id] ?? {}}
                      errors={errors}
                      disabled={createCaseMutation.isPending}
                      onToggle={(id, type) => handleToggle(id, type)}
                      onQuantityChange={(id, type, value) =>
                        handleQuantityChange(id, type, value)
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <section
                aria-labelledby="case-summary-title"
                className="rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_34px_rgba(24,57,51,0.05)]"
              >
                <h2
                  id="case-summary-title"
                  className="hidden text-sm font-semibold text-ink lg:block"
                >
                  خلاصه انتخاب‌ها
                </h2>
                <dl className="grid grid-cols-2 gap-3 border-b border-line pb-4 text-[0.8125rem] lg:mt-2 lg:block lg:space-y-3 lg:text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">اقلام منتخب</dt>
                    <dd className="font-semibold text-ink">
                      {toPersianDigits(selectedProductCount)} قلم
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">ردیف‌های مغایرت</dt>
                    <dd className="font-semibold text-ink">
                      {toPersianDigits(selectedEntries.length)} ردیف
                    </dd>
                  </div>
                </dl>

                {errors.form ? (
                  <p
                    id="summary-form-error"
                    role="alert"
                    className="motion-safe:item-enter wrap-anywhere mt-4 rounded-xl bg-danger-soft px-3 py-2.5 text-[0.75rem] leading-6 text-danger-strong"
                  >
                    {errors.form}
                  </p>
                ) : null}

                {submitError ? (
                  <div
                    role="alert"
                    className="motion-safe:item-enter mt-4 wrap-anywhere text-[0.75rem] leading-6 text-danger-strong"
                  >
                    <p>{submitError}</p>
                    {conflicts && conflicts.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pr-4">
                        {conflicts.map((conflict) => (
                          <li key={`${conflict.orderItemId}:${conflict.type}`}>
                            <a
                              href={`/cases/${conflict.caseId}`}
                              className="font-semibold underline decoration-danger/30 underline-offset-2 hover:decoration-danger"
                            >
                              پرونده {conflict.caseNumber}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    createCaseMutation.isPending || selectedEntries.length === 0
                  }
                  className="motion-safe:transition-all motion-safe:duration-150 mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(13,123,132,0.22)] hover:bg-brand-strong hover:shadow-[0_8px_24px_rgba(13,123,132,0.28)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {createCaseMutation.isPending ? (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
                    />
                  ) : null}
                  {createCaseMutation.isPending ? 'در حال ثبت' : 'ثبت پرونده'}
                </button>
                <p className="mt-3 text-center text-[0.6875rem] leading-5 text-subtle">
                  پس از ثبت، امکان ویرایش یا حذف پرونده وجود ندارد.
                </p>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </section>
  );
}

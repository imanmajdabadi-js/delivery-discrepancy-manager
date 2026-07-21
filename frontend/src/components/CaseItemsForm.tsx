import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useCreateCase } from '../hooks/useCreateCase';
import { ApiError } from '../services';
import type {
  CaseDiscrepancyType,
  CreateCaseItemInput,
  CreateCaseResponse,
  OrderSearchResult,
} from '../types';
import { normalizeSearchQuery, toPersianDigits } from '../utils';
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

  function buildRequestItems() {
    const nextErrors: Record<string, string> = {};
    const requestItems: CreateCaseItemInput[] = [];
    const totals = new Map<string, number>();

    if (selectedEntries.length === 0) {
      nextErrors.form = 'حداقل یک نوع مغایرت برای یکی از اقلام انتخاب کنید.';
    }

    selectedEntries.forEach(({ item, type, value }) => {
      const errorKey = `${item.id}:${type}`;

      if (!/^\d+$/.test(value)) {
        nextErrors[errorKey] = 'یک عدد صحیح بزرگ‌تر از صفر وارد کنید.';
        return;
      }

      const quantity = Number(value);

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        nextErrors[errorKey] = 'یک عدد صحیح بزرگ‌تر از صفر وارد کنید.';
        return;
      }

      if (quantity > item.deliveredQuantity) {
        nextErrors[errorKey] = 'مقدار از تعداد تحویل‌شده بیشتر است.';
      }

      totals.set(item.id, (totals.get(item.id) ?? 0) + quantity);
      requestItems.push({ orderItemId: item.id, type, quantity });
    });

    totals.forEach((total, itemId) => {
      const item = order.items.find((orderItem) => orderItem.id === itemId);

      if (item && total > item.deliveredQuantity) {
        nextErrors[`${itemId}:sum`] =
          'مجموع کسری و آسیب‌دیدگی از مقدار تحویل‌شده بیشتر است.';
      }
    });

    return { requestItems, nextErrors };
  }

  function applyServerError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setSubmitError(
        'پاسخ ثبت پرونده دریافت نشد. اطلاعات واردشده حفظ شده است؛ پیش از تلاش دوباره، فهرست پرونده‌ها را بررسی کنید.',
      );
      return;
    }

    const nextErrors: Record<string, string> = {};

    error.payload?.errors?.forEach((issue) => {
      if (issue.orderItemId && issue.type) {
        nextErrors[`${issue.orderItemId}:${issue.type}`] = issue.message;
      } else if (issue.orderItemId) {
        nextErrors[`${issue.orderItemId}:sum`] = issue.message;
      } else {
        nextErrors.form = issue.message;
      }
    });

    error.payload?.conflicts?.forEach((conflict) => {
      nextErrors[`${conflict.orderItemId}:${conflict.type}`] =
        `این مورد در پرونده ${conflict.caseNumber} باز است.`;
    });

    setErrors(nextErrors);
    setSubmitError(error.message);
    focusFirstProblem();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createCaseMutation.isPending) {
      return;
    }

    const { requestItems, nextErrors } = buildRequestItems();

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
      applyServerError(error);
    }
  }

  return (
    <section aria-labelledby="case-items-title" className="mt-8 scroll-mt-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-mild bg-brand-soft/55 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[0.75rem] font-semibold text-brand">
            سفارش انتخاب‌شده
          </p>
          <h2
            id="case-items-title"
            dir="ltr"
            className="mt-1 text-left text-lg font-bold text-ink"
          >
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-muted">{order.customer.fullName}</p>
        </div>
        <button
          type="button"
          disabled={createCaseMutation.isPending}
          className="inline-flex h-10 items-center justify-center self-start rounded-xl border border-brand-mild bg-surface px-4 text-sm font-semibold text-brand-strong transition hover:bg-brand-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          onClick={onChangeOrder}
        >
          تغییر سفارش
        </button>
      </div>

      <form
        ref={formRef}
        aria-busy={createCaseMutation.isPending}
        className="mt-5 pb-56 lg:pb-0"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <div className="mb-3.5 px-1">
              <h2 className="text-base font-semibold text-ink">
                اقلام دارای مغایرت
              </h2>
              <p className="mt-1 text-sm leading-7 text-muted">
                برای هر قلم، کسری یا آسیب‌دیدگی را انتخاب و مقدار آن را وارد
                کنید.
              </p>
            </div>

            <ul className="space-y-3.5">
              {order.items.map((item) => (
                <CaseItemEditor
                  key={item.id}
                  item={item}
                  quantities={drafts[item.id] ?? {}}
                  errors={errors}
                  disabled={createCaseMutation.isPending}
                  onToggle={handleToggle}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </ul>
          </div>

          <aside className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-line bg-surface/95 p-3 shadow-[0_18px_50px_rgba(24,57,51,0.18)] backdrop-blur-md lg:sticky lg:inset-auto lg:top-6 lg:z-auto lg:rounded-3xl lg:p-5 lg:shadow-[0_12px_36px_rgba(24,57,51,0.05)] lg:backdrop-blur-none">
            <h2 className="hidden text-sm font-semibold text-ink lg:block">
              خلاصه انتخاب‌ها
            </h2>
            <dl className="grid grid-cols-2 gap-3 border-b border-line pb-3 text-[0.8125rem] lg:mt-4 lg:block lg:space-y-3 lg:pb-4 lg:text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">اقلام انتخاب‌شده</dt>
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
                role="alert"
                className="wrap-anywhere mt-4 rounded-xl bg-danger-soft px-3 py-2.5 text-[0.75rem] leading-6 text-danger-strong"
              >
                {errors.form}
              </p>
            ) : null}

            {submitError ? (
              <p
                role="alert"
                className="wrap-anywhere mt-3 text-[0.75rem] leading-6 text-danger-strong"
              >
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={createCaseMutation.isPending}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,118,110,0.18)] transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-65 lg:mt-5 lg:h-12"
            >
              {createCaseMutation.isPending ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
                />
              ) : null}
              {createCaseMutation.isPending ? 'در حال ثبت' : 'ثبت پرونده'}
            </button>
            <p className="mt-3 hidden text-center text-[0.6875rem] leading-5 text-subtle lg:block">
              پس از ثبت، امکان ویرایش یا حذف پرونده وجود ندارد.
            </p>
          </aside>
        </div>
      </form>
    </section>
  );
}

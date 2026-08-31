import { type CaseDiscrepancyType, type OrderSearchItem } from '../types';
import { toPersianDigits } from '../utils';

const typeDetails: Record<
  CaseDiscrepancyType,
  { label: string; description: string; selectedClassName: string }
> = {
  SHORTAGE: {
    label: 'کسری',
    description: 'تعداد تحویل‌نشده',
    selectedClassName: 'border-danger bg-danger-soft text-danger',
  },
  DAMAGED: {
    label: 'آسیب‌دیدگی',
    description: 'تعداد تحویل‌شده معیوب',
    selectedClassName: 'border-accent bg-accent-soft text-accent',
  },
};

interface CaseItemEditorProps {
  item: OrderSearchItem;
  quantities: Partial<Record<CaseDiscrepancyType, string>>;
  errors: Record<string, string>;
  disabled: boolean;
  onToggle: (itemId: string, type: CaseDiscrepancyType) => void;
  onQuantityChange: (
    itemId: string,
    type: CaseDiscrepancyType,
    value: string,
  ) => void;
}

export function CaseItemEditor({
  item,
  quantities,
  errors,
  disabled,
  onToggle,
  onQuantityChange,
}: CaseItemEditorProps) {
  const selectedTypes = (['SHORTAGE', 'DAMAGED'] as const).filter(
    (type) => quantities[type] !== undefined,
  );
  const isSelected = selectedTypes.length > 0;
  const sumError = errors[`${item.id}:sum`];
  const sumErrorId = `quantity-${item.id}-sum-error`;

  return (
    <li
      className="motion-safe:duration-150 rounded-3xl border bg-surface p-5 shadow-[0_4px_18px_rgba(24,57,51,0.04)] transition-[border-color,box-shadow] sm:p-6
        data-[selected=true]:border-brand-mild
        data-[selected=true]:shadow-[0_12px_36px_rgba(24,57,51,0.06)]
        data-[selected=false]:border-line"
      data-selected={isSelected}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="wrap-anywhere text-sm leading-7 font-semibold text-ink sm:text-[0.9375rem]">
            {item.productName}
          </h3>
          <p
            dir="ltr"
            className="wrap-anywhere mt-0.5 text-left text-[0.75rem] text-subtle"
          >
            {item.sku}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-surface-soft px-3 py-2 text-left sm:text-left">
          <p className="text-[0.6875rem] font-semibold text-subtle">
            مقدار تحویل
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            {toPersianDigits(item.deliveredQuantity)} {item.unit}
          </p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-[0.8125rem] font-semibold text-muted">
          نوع مغایرت را انتخاب کنید
        </legend>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {(Object.keys(typeDetails) as CaseDiscrepancyType[]).map((type) => {
            const details = typeDetails[type];
            const isTypeSelected = quantities[type] !== undefined;

            return (
              <button
                key={type}
                type="button"
                data-discrepancy-toggle
                aria-pressed={isTypeSelected}
                disabled={disabled}
                onClick={() => onToggle(item.id, type)}
                className={`motion-safe:transition-all motion-safe:duration-150 relative isolate min-h-12 rounded-xl border px-4 py-3 text-right focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60
                  ${
                    isTypeSelected
                      ? `${details.selectedClassName} border-transparent shadow-[0_6px_18px_rgba(0,0,0,0.05)] active:scale-[0.975]`
                      : 'border-line-strong bg-surface text-ink hover:border-brand-mild hover:bg-brand-soft/40 active:scale-[0.975]'
                  }`}
              >
                <span className="block text-sm font-semibold">
                  {details.label}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] leading-5 opacity-75">
                  {details.description}
                </span>
                {isTypeSelected ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 left-3 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                    >
                      <path d="M5 12l5 5 9-9" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      {selectedTypes.length > 0 ? (
        <div className="motion-safe:delay-75 motion-safe:item-enter mt-4 grid gap-3 sm:grid-cols-2">
          {selectedTypes.map((type) => {
            const fieldId = `quantity-${item.id}-${type}`;
            const errorKey = `${item.id}:${type}`;
            const error = errors[errorKey];
            const descriptionIds = [
              error ? `${fieldId}-error` : null,
              sumError ? sumErrorId : null,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={type}>
                <label
                  htmlFor={fieldId}
                  className="mb-1.5 block text-[0.8125rem] font-semibold text-ink"
                >
                  مقدار {typeDetails[type].label}
                </label>
                <div className="relative">
                  <input
                    id={fieldId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={disabled}
                    value={quantities[type] ?? ''}
                    aria-invalid={Boolean(error || sumError)}
                    aria-describedby={descriptionIds || undefined}
                    className="motion-safe:transition-all motion-safe:duration-150 h-11 w-full rounded-xl border border-line-strong bg-surface px-3 pl-16 text-[0.9375rem] text-ink outline-none placeholder:text-subtle hover:border-brand-mild focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-mild/55 aria-invalid:border-danger aria-invalid:ring-danger-soft disabled:bg-surface-soft disabled:text-subtle"
                    placeholder="۰"
                    onChange={(event) =>
                      onQuantityChange(item.id, type, event.target.value)
                    }
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[0.75rem] text-subtle"
                  >
                    {item.unit}
                  </span>
                </div>
                {error ? (
                  <p
                    id={`${fieldId}-error`}
                    role="alert"
                    className="motion-safe:item-enter mt-1.5 text-[0.75rem] leading-5 text-danger-strong"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {sumError ? (
        <p
          id={sumErrorId}
          role="alert"
          className="motion-safe:item-enter mt-3 rounded-xl bg-danger-soft px-3 py-2 text-[0.75rem] leading-6 text-danger-strong"
        >
          {sumError}
        </p>
      ) : null}
    </li>
  );
}

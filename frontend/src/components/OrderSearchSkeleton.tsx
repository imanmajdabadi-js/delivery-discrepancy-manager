export function OrderSearchSkeleton() {
  return (
    <section
      aria-label="در حال دریافت اطلاعات سفارش"
      aria-busy="true"
      className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_12px_40px_rgba(24,57,51,0.05)]"
    >
      <div className="motion-safe:animate-pulse">
        <div className="flex flex-col gap-5 border-b border-line bg-surface-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded-full bg-brand-soft" />
            <div className="h-6 w-44 rounded-lg bg-line" />
          </div>
          <div className="h-8 w-29 rounded-full bg-success-soft" />
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-16 rounded-full bg-line" />
              <div className="h-5 w-32 rounded-lg bg-line" />
            </div>
          ))}
        </div>
        <div className="border-t border-line px-5 py-5 sm:px-6">
          <div className="mb-4 h-5 w-28 rounded-lg bg-line" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-13 rounded-xl bg-surface-soft" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

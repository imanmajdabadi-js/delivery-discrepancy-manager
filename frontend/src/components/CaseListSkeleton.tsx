export function CaseListSkeleton() {
  return (
    <section
      aria-label="در حال دریافت فهرست پرونده‌ها"
      aria-busy="true"
      className="mt-5 motion-safe:animate-pulse"
    >
      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-line" />
                <div className="h-5 w-32 rounded bg-line" />
              </div>
              <div className="h-8 w-24 rounded-full bg-line" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
              {Array.from({ length: 4 }, (_, itemIndex) => (
                <div key={itemIndex} className="space-y-2">
                  <div className="h-3 w-14 rounded bg-line" />
                  <div className="h-4 w-24 rounded bg-line" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
        <div className="h-13 border-b border-line bg-surface-soft" />
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-8 border-b border-line px-5 py-5 last:border-b-0"
          >
            {Array.from({ length: 5 }, (_, cellIndex) => (
              <div key={cellIndex} className="h-4 rounded bg-line" />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

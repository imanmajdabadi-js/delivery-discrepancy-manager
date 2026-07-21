export function CaseDetailsSkeleton() {
  return (
    <main
      aria-label="در حال دریافت اطلاعات پرونده"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl animate-pulse px-4 py-7 motion-reduce:animate-none sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="h-5 w-32 rounded-full bg-line/70" />
      <div className="mt-5 rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-3.5 w-24 rounded-full bg-line" />
            <div className="mt-3 h-8 w-52 rounded-xl bg-line/80" />
          </div>
          <div className="h-8 w-24 rounded-full bg-line" />
        </div>
        <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          <div className="h-4 w-44 rounded-full bg-line/70" />
          <div className="h-4 w-40 rounded-full bg-line/70" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
            <div className="h-5 w-36 rounded-full bg-line" />
            <div className="mt-5 space-y-3">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-30 rounded-2xl border border-line bg-surface-soft"
                />
              ))}
            </div>
          </div>
          <div className="h-64 rounded-3xl border border-line bg-surface" />
        </div>
        <div className="h-88 rounded-3xl border border-line bg-surface" />
      </div>
    </main>
  );
}

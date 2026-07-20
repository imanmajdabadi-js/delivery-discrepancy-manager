export function CasesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
      <header className="max-w-3xl">
        <p className="mb-2.5 text-[0.8125rem] font-semibold text-brand sm:text-sm">
          مدیریت عملیات پس از تحویل
        </p>
        <h1 className="text-[1.625rem] leading-[1.55] font-bold text-ink sm:text-[1.75rem]">
          پرونده‌های مغایرت
        </h1>
        <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-7.5 text-muted sm:text-base sm:leading-8">
          گزارش‌های کسری و آسیب‌دیدگی اقلام تحویل‌شده از این بخش ثبت و پیگیری
          می‌شوند.
        </p>
      </header>

      <section
        aria-labelledby="empty-cases-title"
        className="empty-state-card mt-9 rounded-2xl border border-dashed border-line px-5 py-12 text-center shadow-[0_1px_2px_rgba(23,33,31,0.03)] sm:mt-10 sm:px-8 sm:py-14"
      >
        <span
          aria-hidden="true"
          className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
          >
            <path d="M8 4h8M9 3v2m6-2v2" />
            <path d="M7 5h10a2 2 0 0 1 2 2v12H5V7a2 2 0 0 1 2-2Z" />
            <path d="M9 10h6m-6 4h4" />
          </svg>
        </span>
        <h2
          id="empty-cases-title"
          className="mt-4 text-[1.0625rem] leading-7 font-semibold text-ink"
        >
          هنوز پرونده‌ای ثبت نشده است
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-7 text-muted sm:text-[0.9375rem]">
          پس از ثبت اولین پرونده، اطلاعات اصلی و وضعیت رسیدگی آن در این صفحه
          نمایش داده می‌شود.
        </p>
      </section>
    </main>
  );
}

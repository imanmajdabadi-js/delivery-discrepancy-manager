import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * A navigational component that helps users understand their location within the app.
 * Follows the brand's visual identity using Tailwind CSS.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol className="flex items-center gap-2 text-[0.8125rem] font-medium text-muted">
        <li>
          <Link
            to="/"
            className="motion-safe:transition-colors motion-safe:duration-200 hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            پرونده‌ها
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3 shrink-0 text-subtle/60"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            {item.to ? (
              <Link
                to={item.to}
                className="motion-safe:transition-colors motion-safe:duration-200 hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-strong" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

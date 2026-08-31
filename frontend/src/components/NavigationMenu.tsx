import { Link } from 'react-router-dom';

interface NavigationItem {
  label: string;
  to: string;
  isActive: boolean;
}

interface NavigationMenuProps {
  items: NavigationItem[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          aria-current={item.isActive ? 'page' : undefined}
          className={`relative inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            item.isActive
              ? 'bg-brand-soft/50 text-brand-strong'
              : 'text-muted hover:bg-surface-soft hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils';
import { NavigationMenu } from '../components/NavigationMenu';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    void navigate('/login');
  };

  return (
    <div className="app-canvas min-h-screen text-ink">
      <header className="app-header relative border-b border-line bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex min-h-17 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <span className="brand-mark grid size-10 place-items-center rounded-2xl text-brand">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M4.5 7.5 12 3l7.5 4.5v9L12 21l-7.5-4.5z" />
                <path d="m4.8 7.7 7.2 4.2 7.2-4.2M12 12v8.6" />
                <path d="m8.2 5.3 7.4 4.4" />
              </svg>
            </span>
            <span className="text-[0.9375rem] font-semibold text-ink">
              سامانه رسیدگی به مغایرت تحویل
            </span>
          </Link>

          <nav className="flex items-center gap-1.5" aria-label=" منوی اصلی">
            <NavigationMenu
              items={[
                {
                  label: 'پرونده‌ها',
                  to: '/',
                  isActive: location.pathname === '/',
                },
                ...(userRole === 'MANAGER'
                  ? [
                      {
                        label: 'صادرکننده تصمیم',
                        to: '/cases/review',
                        isActive: location.pathname === '/cases/review',
                      },
                    ]
                  : []),
              ]}
            />
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="motion-safe:transition-all motion-safe:duration-200 relative inline-flex items-center justify-center rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-muted hover:border-brand-mild hover:text-ink hover:shadow-[0_4px_12px_rgba(13,123,132,0.08)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            خروج
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

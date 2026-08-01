import { Link, Outlet, useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils';

export function AppLayout() {
  const navigate = useNavigate();
  const userRole = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="app-canvas min-h-screen text-ink">
      <header className="app-header border-b border-line bg-surface">
        <div className="mx-auto flex min-h-17 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <span
              aria-hidden="true"
              className="brand-mark grid size-9 place-items-center rounded-xl text-brand"
            >
              <svg
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

          <nav className="flex items-center gap-1.5">
            {userRole === 'MANAGER' ? (
              <Link
                to="/cases/review"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                صادرکننده تصمیم
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink hover:bg-surface-2"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

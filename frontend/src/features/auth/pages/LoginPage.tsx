import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, login } from '../../../services';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email, password);
      localStorage.setItem('auth_token', response.access_token);
      void navigate('/');
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'خطا در ورود به سیستم. لطفاً اطلاعات را بررسی کنید.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-hero flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="login-brand flex flex-col items-center text-center lg:items-start lg:text-right">
          <div className="relative mb-8 flex size-[260px] shrink-0 items-center justify-center opacity-60 animate-logoReveal motion-reduce:animate-none">
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              fill="none"
              className="size-full"
            >
              <defs>
                <linearGradient
                  id="routeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgb(13 123 132)" />
                  <stop offset="100%" stopColor="rgb(217 119 6)" />
                </linearGradient>
              </defs>
              <g stroke="url(#routeGradient)" strokeWidth="1.5">
                <path d="M25 85 L45 55 L75 65 L95 35" />
                <path d="M15 75 L40 45 L65 55" />
                <path d="M35 95 L60 75 L85 85 L105 55" />
              </g>
              <g fill="rgb(13 123 132)">
                <circle cx="25" cy="85" r="3.5" />
                <circle cx="45" cy="55" r="3.5" />
                <circle cx="75" cy="65" r="3.5" />
                <circle cx="95" cy="35" r="3.5" />
                <circle cx="15" cy="75" r="3" fillOpacity="0.6" />
                <circle cx="60" cy="75" r="3" fillOpacity="0.6" />
                <circle cx="105" cy="55" r="3" fillOpacity="0.6" />
              </g>
            </svg>
            <span className="brand-mark absolute grid size-14 place-items-center rounded-2xl text-brand animate-nodePulse motion-reduce:animate-none">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7"
              >
                <path d="M4.5 7.5 12 3l7.5 4.5v9L12 21l-7.5-4.5z" />
                <path d="m4.8 7.7 7.2 4.2 7.2-4.2M12 12v8.6" />
                <path d="m8.2 5.3 7.4 4.4" />
              </svg>
            </span>
          </div>

          <div className="mb-8 flex items-center gap-4 justify-center lg:justify-start">
            <span className="brand-mark grid size-12 shrink-0 place-items-center rounded-2xl text-brand">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7"
              >
                <path d="M4.5 7.5 12 3l7.5 4.5v9L12 21l-7.5-4.5z" />
                <path d="m4.8 7.7 7.2 4.2 7.2-4.2M12 12v8.6" />
                <path d="m8.2 5.3 7.4 4.4" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-ink sm:text-[1.4rem]">
                سامانه مدیریت مغایرت تحویل
              </h1>
              <p className="mt-1 text-sm text-muted">
                پلتفرم رصد و پیگیری مغایرت‌های لجستیک
              </p>
            </div>
          </div>

          <p className="mx-auto max-w-md text-[0.9375rem] leading-8 text-muted lg:mx-0 lg:text-base">
            سامانه مدیریت مغایرت تحویل برای پایش، ثبت و پیگیری کیفیت تحویل
            سفارشات لجستیک.
          </p>

          <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
            <div className="flex -space-x-2">
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand-soft text-xs font-bold text-brand">
                ۲۴
              </span>
              <span className="flex size-8 -ml-2 items-center justify-center rounded-full border-2 border-white bg-brand-soft text-xs font-bold text-brand">
                ۷
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">
                ۲۴/۷ پوشش عملیاتی
              </p>
              <p className="text-xs text-muted">پشتیبانی از فرآیندهای لجستیک</p>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm text-muted">
            <div className="h-px flex-1 bg-line"></div>
            <span className="px-1">سازگار با استانداردهای صنعتی</span>
            <div className="h-px flex-1 bg-line"></div>
          </div>
        </div>

        <div className="login-card relative">
          <div className="login-particles pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-brand/5 motion-reduce:animate-none"
                style={{
                  width: `${12 + i * 4}px`,
                  height: `${12 + i * 4}px`,
                  top: `${15 + ((i * 11) % 60)}%`,
                  left: `${10 + ((i * 17) % 80)}%`,
                  animation: `particleFloat ${4 + i}s infinite ease-in-out ${i * 0.8}s`,
                }}
              />
            ))}
          </div>

          <form onSubmit={handleLogin} className="relative space-y-5">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3.5 text-sm text-danger"
              >
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                ایمیل سازمانی
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block h-12 w-full rounded-xl border border-line bg-surface px-4 text-[0.9375rem] text-ink outline-none placeholder:text-subtle focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft/50 disabled:bg-canvas/60"
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block h-12 w-full rounded-xl border border-line bg-surface px-4 text-[0.9375rem] text-ink outline-none placeholder:text-subtle focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft/50 disabled:bg-canvas/60"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand to-brand-strong px-4 text-[0.9375rem] font-semibold text-white shadow-[0_8px_20px_rgba(13,123,132,0.25)] motion-safe:transition-all motion-safe:duration-200 hover:shadow-[0_8px_24px_rgba(13,123,132,0.3)] hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-[0_8px_20px_rgba(13,123,132,0.25)]"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                  />
                  <span className="ml-2">در حال ورود...</span>
                </>
              ) : (
                <>
                  <span className="ml-2">ورود به پنل</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 10l3 3 3-3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-line pt-5 text-center text-[0.8125rem] text-muted">
            ورود فقط با حساب فعال سازمانی امکان‌پذیر است.
          </p>
        </div>
      </div>
    </div>
  );
}

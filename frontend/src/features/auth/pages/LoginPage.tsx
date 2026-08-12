import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, login } from '../../../services';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email, password);
      localStorage.setItem('auth_token', response.access_token);
      navigate('/');
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'خطا در ورود به سیستم. لطفاً اطلاعات را بررسی کنید.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas px-4 py-12 text-right sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-8 text-center">
          <h2 className="text-[1.625rem] leading-[1.55] font-bold text-ink sm:text-[1.75rem]">
            سامانه مدیریت مغایرت لجستیک
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-7.5 text-muted sm:text-base sm:leading-8">
            ورود به سیستم
          </p>
        </div>

        <div className="login-card w-full rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
          {error && (
            <div
              className="mb-6 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3.5 text-sm text-danger-strong"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
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
                className="block h-12 w-full rounded-xl border border-line bg-surface px-4 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft disabled:bg-canvas/60"
                placeholder="name@company.com"
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
                className="block h-12 w-full rounded-xl border border-line bg-surface px-4 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft disabled:bg-canvas/60"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-transparent bg-brand px-4 text-[0.9375rem] font-semibold text-white shadow-[0_8px_20px_rgba(15,118,110,0.18)] transition hover:bg-brand-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              حساب کاربری ندارید؟{' '}
              <Link
                to="/register"
                className="font-medium text-brand transition hover:text-brand-strong focus-visible:rounded-sm focus-visible:outline-3 focus-visible:outline-brand"
              >
                ثبت‌نام کاربر جدید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

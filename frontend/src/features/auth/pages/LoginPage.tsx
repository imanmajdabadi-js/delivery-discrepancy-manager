import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('operator', JSON.stringify(res.data.operator));
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'خطا در ورود به سیستم. لطفاً اطلاعات را بررسی کنید.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas px-4 py-12 text-right sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            سامانه مدیریت مغایرت لجستیک
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            ورود اپراتور به سیستم
          </p>
        </div>

        <div className="login-card w-full rounded-2xl border border-line bg-surface px-6 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-8">
          {error && (
            <div
              className="mb-5 rounded-xl border border-danger/20 bg-surface px-4 py-3 text-sm text-danger"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-ink"
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
                className="block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand-soft disabled:bg-canvas/60"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-ink"
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
                className="block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand-soft disabled:bg-canvas/60"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl border border-transparent bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              حساب کاربری ندارید؟{' '}
              <Link
                to="/register"
                className="font-medium text-brand transition hover:text-brand-strong focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft"
              >
                ثبت‌نام اپراتور جدید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

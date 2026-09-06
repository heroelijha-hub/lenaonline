'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/actions/auth';
import { useTranslations } from 'next-intl';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const t = useTranslations('LoginModal');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginUser(formData);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
        router.push('/account');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-500 hover:text-orange-600 rounded-full p-1 shadow-md w-8 h-8 flex items-center justify-center border border-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('title')}</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          <div>
            <input
              type="email"
              name="email"
              required
              placeholder={t('email_placeholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder={t('password_placeholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-slate-900 border-gray-300 rounded focus:ring-slate-900"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                {t('remember_me')}
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-orange-500 hover:text-orange-600">
                {t('lost_password')}
              </a>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isPending ? t('login_loading') : t('login_button')}
            </button>
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {t('create_account')}
            </Link>
          </div>
        </form>

        {/* Google Login Section - Temporarily Hidden 
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('or_login_with')}</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('continue_with_google')}
            </button>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}

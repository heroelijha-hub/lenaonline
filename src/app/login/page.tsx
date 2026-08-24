'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/actions/auth';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const t = useTranslations('Auth');
  
  const [isPendingLogin, startTransitionLogin] = useTransition();
  const [loginError, setLoginError] = useState('');

  const [isPendingRegister, startTransitionRegister] = useTransition();
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    const formData = new FormData(e.currentTarget);
    startTransitionLogin(async () => {
      const res = await loginUser(formData);
      if (res.error) {
        setLoginError(res.error);
      } else {
        router.push('/account');
      }
    });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    const formData = new FormData(e.currentTarget);
    startTransitionRegister(async () => {
      const res = await registerUser(formData);
      if (res.error) {
        setRegisterError(res.error);
      } else if (res.message) {
        setRegisterSuccess(res.message);
      } else {
        router.push('/account');
      }
    });
  };

  return (
    <div className="flex flex-col bg-gray-50 font-sans">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LOGIN CARD */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('login_title')}</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && <div className="text-red-500 text-sm font-medium">{loginError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email_address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')} <span className="text-red-500">*</span>
                </label>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showLoginPassword ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                  {t('remember_me')}
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPendingLogin}
                  className="w-1/2 min-w-[140px] py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none disabled:opacity-50"
                >
                  {isPendingLogin ? t('logging_in') : t('log_in_btn')}
                </button>
              </div>
            </form>

            <div className="mt-6 flex justify-end">
              <Link href="#" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                {t('lost_password')}
              </Link>
            </div>
          </div>

          {/* REGISTER CARD */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('register_title')}</h2>
            <form onSubmit={handleRegister} className="space-y-5">
              {registerError && <div className="text-red-500 text-sm font-medium">{registerError}</div>}
              {registerSuccess && <div className="text-green-600 bg-green-50 border border-green-200 p-3 rounded-md text-sm font-medium">{registerSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('username')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email_address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')} <span className="text-red-500">*</span>
                </label>
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showRegisterPassword ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPendingRegister}
                  className="w-1/2 min-w-[140px] py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none disabled:opacity-50"
                >
                  {isPendingRegister ? t('registering') : t('register_btn')}
                </button>
              </div>
            </form>


          </div>
          
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { updateAccountDetails } from '@/actions/account';
import { useTranslations } from 'next-intl';

interface AccountDetailsFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
  };
}

export default function AccountDetailsForm({ initialData }: AccountDetailsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const t = useTranslations('AccountDetails');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateAccountDetails(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess(t('save_success'));
        // Reset password fields
        (document.getElementById('currentPassword') as HTMLInputElement).value = '';
        (document.getElementById('newPassword') as HTMLInputElement).value = '';
        (document.getElementById('confirmPassword') as HTMLInputElement).value = '';
      }
    });
  };

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-md border border-red-200">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 text-sm font-medium rounded-md border border-green-200">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('first_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            required
            defaultValue={initialData.firstName}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('last_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            required
            defaultValue={initialData.lastName}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('display_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="displayName"
          required
          defaultValue={initialData.displayName}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        />
        <p className="mt-1.5 text-sm text-gray-500 italic">
          {t('display_name_hint')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('email_address')} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          defaultValue={initialData.email}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <hr className="border-gray-200 my-8" />

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('password_change_title')}</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('current_password')}
            </label>
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('new_password')}
            </label>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('confirm_password')}
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
        >
          {isPending ? t('saving') : t('save_changes_btn')}
        </button>
      </div>
    </form>
  );
}

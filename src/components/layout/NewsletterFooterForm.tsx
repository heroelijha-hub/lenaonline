'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitNewsletter } from '@/actions/contact';

interface Props {
  placeholder?: string;
}

export default function NewsletterFooterForm({ placeholder = 'Geben Sie Ihre Email ein' }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.set('email', email);

    startTransition(async () => {
      const res = await submitNewsletter(formData);
      if (res.error) {
        setError(res.error);
      } else {
        // Redirection vers la page Thank You
        router.push('/thank-you');
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={isPending}
          className="flex-grow px-4 py-3 rounded-l-sm bg-gray-50 text-gray-900 text-sm focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#fbbf24] hover:bg-yellow-500 text-gray-900 px-4 py-3 rounded-r-sm transition flex items-center justify-center disabled:opacity-60"
          aria-label="S'inscrire à la newsletter"
        >
          {isPending ? (
            <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs text-red-300 font-medium">{error}</p>
      )}
    </div>
  );
}

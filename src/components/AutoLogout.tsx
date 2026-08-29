'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/actions/auth';

interface AutoLogoutProps {
  timeoutMs?: number;
  redirectUrl: string;
}

export default function AutoLogout({ timeoutMs = 15 * 60 * 1000, redirectUrl }: AutoLogoutProps) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      await logoutUser();
      router.push(redirectUrl);
    };

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleLogout, timeoutMs);
    };

    // Initialize the timer on mount
    resetTimer();

    // List of events that indicate user activity (including custom events)
    const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll', 'user-activity'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup listeners and timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMs, redirectUrl, router]);

  return null; // This component is invisible
}

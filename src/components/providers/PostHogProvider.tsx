'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ne pas charger PostHog du tout sur les pages d'administration
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Only initialize PostHog if the keys are available
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      // Check if already initialized to avoid re-init in strict mode
      import('posthog-js').then((m) => {
        const posthog = m.default;
        if (!posthog.__loaded) {
          posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
            person_profiles: 'identified_only',
            capture_pageview: false,
            session_recording: {
              maskAllInputs: true,
              maskTextSelector: '*[data-ph-mask="true"]'
            }
          });
        }
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      import('posthog-js').then((m) => {
        if (m.default.__loaded) {
          m.default.stopSessionRecording();
        }
      });
      return;
    }

    if (pathname) {
      import('posthog-js').then((m) => {
        const posthog = m.default;
        if (posthog.__loaded) {
          posthog.startSessionRecording();
          
          let url = window.origin + pathname;
          if (searchParams && searchParams.toString()) {
            url = url + `?${searchParams.toString()}`;
          }
          posthog.capture('$pageview', {
            $current_url: url,
          });
        }
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

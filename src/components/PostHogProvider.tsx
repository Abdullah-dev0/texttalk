'use client';

import posthogClient from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isProd = process.env.NODE_ENV === 'production';
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!isProd) {
      posthogClient.opt_out_capturing?.();
      return;
    }

    if (!key) return;

    posthogClient.init(key, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_exceptions: true, // Enable PostHog error tracking
      debug: false,
    });
  }, [isProd]);

  if (!isProd) return <>{children}</>;
  return <PHProvider client={posthogClient}>{children}</PHProvider>;
}

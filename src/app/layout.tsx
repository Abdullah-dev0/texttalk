import { ClerkProvider } from '@clerk/nextjs';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { extractRouterConfig } from 'uploadthing/server';

import { ourFileRouter } from '@/app/api/uploadthing/core';
import Providers from '@/components/Providers';
import 'simplebar-react/dist/simplebar.min.css';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { cn, constructMetadata } from '@/lib/utils';
const inter = Inter({ subsets: ['latin'] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterMultiSessionSingleSignOutUrl="/">
      <html lang="en" className="light">
        <Providers>
          <body
            className={cn(
              'min-h-screen font-sans antialiased grainy',
              inter.className
            )}
          >
            <Toaster duration={3000} richColors />
            <NextSSRPlugin
              /**
               * The `extractRouterConfig` will extract **only** the route configs
               * from the router to prevent additional information from being
               * leaked to the client. The data passed to the client is the same
               * as if you were to fetch `/api/uploadthing` directly.
               */
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
            <Analytics />
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}

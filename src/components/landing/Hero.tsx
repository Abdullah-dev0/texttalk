import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* radial gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.08),_transparent_60%)]" />
        <div className="absolute -top-40 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative flex flex-col items-center text-center pt-28 sm:pt-40">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-5 py-1.5 text-xs font-medium backdrop-blur supports-[backdrop-filter]:bg-background/40 ring-1 ring-border">
          <span
            className="inline-flex size-2 animate-pulse rounded-full bg-primary"
            aria-hidden
          />
          <span>Public Beta is live</span>
        </div>
        <h1 className="font-bold tracking-tight text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          Chat with your{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            documents
          </span>{' '}
          instantly
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Upload a PDF and start an AI-powered conversation in seconds. No
          complex setup, just answers.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'group relative overflow-hidden'
            )}
          >
            <span className="relative z-10 flex items-center">
              Get started
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <Link
            href="#how-it-works"
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}
          >
            How it works
          </Link>
        </div>

        <div className="mt-20 w-full max-w-6xl">
          <div className="relative rounded-xl border bg-card/50 p-2 sm:p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/40 ring-1 ring-border">
            <div className="absolute inset-0 rounded-xl bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_15%,rgba(255,255,255,0)_30%)] animate-[shimmer_3.5s_ease-in-out_infinite] [mask:linear-gradient(#000,#000,#0000)]" />
            <Image
              src="/dashboard-preview.jpg"
              alt="Dashboard preview"
              width={1364}
              height={866}
              priority
              quality={100}
              className="rounded-lg border object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

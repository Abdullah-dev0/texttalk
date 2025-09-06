import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CTASection = () => {
  return (
    <section className="mt-40">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-10 text-center shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.25),_transparent_60%)]" />
        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Ready to supercharge how you read PDFs?
        </h2>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Sign up and start chatting with your documents in under a minute.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: 'lg' }), 'group relative')}
          >
            Get started free
            <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

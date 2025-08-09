import Link from 'next/link';

import MaxWidthWrapper from '@/components/MaxWidthWrapper';

const steps = [
  {
    title: 'Create your account',
    description: (
      <>
        Start free or upgrade anytime to unlock higher limits and faster
        responses.
      </>
    ),
  },
  {
    title: 'Upload a PDF',
    description: 'We index and embed it securely for fast semantic search.',
  },
  {
    title: 'Ask anything',
    description: 'Get grounded, citation-rich answers in real time.',
  },
];

const FeatureSteps = () => {
  return (
    <section id="how-it-works" className="scroll-mt-24">
      <MaxWidthWrapper className="mt-40 sm:mt-56">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start chatting in minutes
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            No training wheels. Just upload and converse.
          </p>
        </div>

        <ol className="mt-16 space-y-8 md:grid md:grid-cols-3 md:gap-10 md:space-y-0">
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full border bg-background text-sm font-semibold ring-1 ring-border">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold leading-snug">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need bigger volumes?{' '}
          <Link
            href="/contact"
            className="text-primary underline-offset-4 hover:underline"
          >
            Contact sales
          </Link>
        </p>
      </MaxWidthWrapper>
    </section>
  );
};

export default FeatureSteps;

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
      <div className="mt-40 sm:mt-56">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start chatting in minutes
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            No training wheels. Just upload and converse.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-5 lg:grid-cols-3 mt-8 justify-center">
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
      </div>
    </section>
  );
};

export default FeatureSteps;

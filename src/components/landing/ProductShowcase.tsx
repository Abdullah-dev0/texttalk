import Image from 'next/image';

const ProductShowcase = () => {
  return (
    <section className="mt-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 space-y-6 lg:order-1">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Fast, accurate & secure
          </h2>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span
                className="mt-1 size-2 rounded-full bg-primary"
                aria-hidden
              />
              Enterprise-grade encryption at rest & in transit.
            </li>
            <li className="flex gap-2">
              <span
                className="mt-1 size-2 rounded-full bg-primary"
                aria-hidden
              />
              Fast vector search for sub-second responses.
            </li>
            <li className="flex gap-2">
              <span
                className="mt-1 size-2 rounded-full bg-primary"
                aria-hidden
              />
              Grounded citations for transparency.
            </li>
            <li className="flex gap-2">
              <span
                className="mt-1 size-2 rounded-full bg-primary"
                aria-hidden
              />
              Multi-language understanding out of the box.
            </li>
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative rounded-xl border bg-card/50 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/40 ring-1 ring-border">
            <Image
              src="/file-upload-preview.jpg"
              alt="Upload experience"
              width={1419}
              height={732}
              quality={90}
              className="rounded-lg border object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;

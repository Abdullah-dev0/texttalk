import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How does the PDF chat work?',
    a: 'We parse, chunk & embed your PDF securely, then perform semantic retrieval + LLM reasoning to answer questions with grounded context.',
  },
  {
    q: 'Is my data secure?',
    a: 'All uploads are encrypted at rest & in transit. We do not train models on your private content.',
  },
  {
    q: 'What types of documents can I upload?',
    a: 'PDF up to 10MB today. More formats (DOCX, PPTX, TXT) are on the roadmap.',
  },
  {
    q: 'How accurate are the answers?',
    a: 'High accuracy with source-grounded responses. We still recommend verifying critical information inside the original document.',
  },
  {
    q: 'Do you support multiple languages?',
    a: 'Yes. Multilingual embedding enables over 100 languages for both documents and queries.',
  },
];

export function FAQ() {
  return (
    <section className="mt-40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

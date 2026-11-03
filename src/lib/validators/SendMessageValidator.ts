import { z } from 'zod';

import { languages } from '@/constant';

// The body of POST /api/chat: only the new message, as useChat's
// sendMessage({ text }) makes it: one non-empty text part. Other fields are
// dropped, so the parsed message is safe to send to the model and save.
// Its id is kept as the message's database id.
export const SendMessageValidator = z.object({
  fileId: z.string(),
  // Goes into the system prompt, so only the languages the page offers.
  language: z
    .string()
    .toLowerCase()
    .refine((value) => languages.some((l) => l.language === value)),
  message: z.object({
    id: z.string().regex(/^[\w-]{1,64}$/),
    role: z.literal('user'),
    parts: z.tuple([
      z.object({ type: z.literal('text'), text: z.string().trim().min(1) }),
    ]),
  }),
});

export const summarizeCheck = z.object({
  text: z.string(),
  option: z.enum(['Summarize', 'Paraphrase']),
  language: z.string().default('english'),
  id: z.string(),
});

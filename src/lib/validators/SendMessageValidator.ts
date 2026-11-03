import { z } from 'zod';

import { languages } from '@/constant';

// The body of POST /api/chat: only the new message, as useChat made it.
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
    parts: z.array(
      z.object({ type: z.string(), text: z.string().optional() }).loose()
    ),
  }),
});

export const summarizeCheck = z.object({
  text: z.string(),
  option: z.enum(['Summarize', 'Paraphrase']),
  language: z.string().default('english'),
  id: z.string(),
});

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { auth } from '@clerk/nextjs/server';
import { PineconeStore } from '@langchain/pinecone';
import { Prisma } from '@prisma/client';
import {
  consumeStream,
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from 'ai';
import { NextRequest } from 'next/server';

import { db } from '@/db';
import { embeddings } from '@/lib/embeddings';
import index from '@/lib/pinecone';
import { rateLimiter } from '@/lib/rateLimiter';
import { chatPrompt } from '@/lib/templates/chat-templates';
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator';

export const maxDuration = 60;

// How many earlier messages the model sees.
const HISTORY_SIZE = 6;

// Create Gemini model instance
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
const model = google('gemini-3.6-flash');

// IDs for the AI's messages, made on the server so they are known before saving.
const generateMessageId = createIdGenerator({ prefix: 'msg', size: 16 });

export const POST = async (req: NextRequest) => {
  // When the question was asked. The answer is saved later, so it always
  // sorts after the question.
  const askedAt = new Date();

  // The client sends only the new message; the history comes from the database.
  const parsed = SendMessageValidator.safeParse(await req.json());

  if (!parsed.success) return new Response('Bad request', { status: 400 });

  // The validator kept only one text part, so this is the whole question.
  const { message, fileId, language } = parsed.data;
  const messageText = message.parts[0].text;

  // Reads the user id from the session; currentUser() would also call Clerk's API.
  const { userId } = await auth();

  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { success } = await rateLimiter.limit(userId);
  if (!success) {
    return new Response('Rate limit exceeded please try again later', {
      status: 429,
    });
  }

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response('Not found', { status: 404 });

  const vectorStorePromise = PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: file.id,
  });

  // Fetch relevant docs and recent messages in parallel
  const [retrievedDocs, prevMessagesList] = await Promise.all([
    vectorStorePromise.then((vs) => vs.similaritySearch(messageText, 3)),
    db.message.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_SIZE,
    }),
  ]);

  // Saved messages are UIMessages already; re-order them to chronological.
  const uiMessages: UIMessage[] = [
    ...prevMessagesList.reverse().map((msg): UIMessage => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts as UIMessage['parts'],
    })),
    message,
  ];

  const context = retrievedDocs
    .map((doc) => {
      const content = doc.pageContent || '';
      return `${content}\nPage Number: ${doc.metadata?.pageNumber}`;
    })
    .join('\n\n');

  // Generate response using AI SDK. Stop in the browser closes the request,
  // and req.signal then stops Gemini too.
  const result = streamText({
    model,
    instructions: chatPrompt(context, language),
    messages: await convertToModelMessages(uiMessages),
    temperature: 0.3,
    abortSignal: req.signal,
    // streamText keeps errors out of the response, so log them here.
    onError: ({ error }) => console.error('Chat stream error:', error),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: uiMessages,
      generateMessageId,
      // Runs when the answer is complete, and also when the user pressed Stop:
      // then responseMessage holds what the user already saw, so reloading the
      // page matches the chat.
      onEnd: async ({ responseMessage }) => {
        const hasText = responseMessage.parts.some(
          (part) => part.type === 'text' && part.text.trim()
        );
        if (!hasText) return; // nothing was shown, nothing to save
        try {
          await db.message.createMany({
            data: [
              {
                id: message.id,
                role: 'user',
                // Parts are plain JSON data; the cast only tells TypeScript
                // they fit Prisma's Json type.
                parts: message.parts as Prisma.InputJsonValue,
                userId,
                fileId,
                createdAt: askedAt,
              },
              {
                id: responseMessage.id,
                role: 'assistant',
                parts: responseMessage.parts as Prisma.InputJsonValue,
                userId,
                fileId,
                createdAt: new Date(),
              },
            ],
          });
        } catch (error) {
          console.error('Error saving messages:', error);
        }
      },
    }),
    // Reads a copy of the stream to the end even after the client disconnects,
    // so onEnd still runs when the user presses Stop.
    consumeSseStream: ({ stream }) => consumeStream({ stream }),
  });
};

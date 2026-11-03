import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { currentUser } from '@clerk/nextjs/server';
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

const textOf = (message: UIMessage) =>
  message.parts.map((part) => (part.type === 'text' ? part.text : '')).join('');

export const POST = async (req: NextRequest) => {
  // When the question was asked. The answer is saved later, so it always
  // sorts after the question.
  const askedAt = new Date();

  // The client sends only the new message; the history comes from the database.
  const parsed = SendMessageValidator.safeParse(await req.json());

  if (!parsed.success) return new Response('Bad request', { status: 400 });

  const { message, fileId, language } = parsed.data;

  const messageText = textOf(message as UIMessage);

  if (!messageText.trim()) {
    return new Response('Message is required', { status: 400 });
  }

  const user = await currentUser();

  if (!user) return new Response('Unauthorized', { status: 401 });

  const { success } = await rateLimiter.limit(user.id);
  if (!success) {
    return new Response('Rate limit exceeded please try again later', {
      status: 429,
    });
  }

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
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

  // Rebuilt with only its text, so a client can't save or send other parts.
  const question: UIMessage = {
    id: message.id,
    role: 'user',
    parts: [{ type: 'text', text: messageText }],
  };

  // Saved messages are UIMessages already; re-order them to chronological.
  const uiMessages: UIMessage[] = [
    ...prevMessagesList.reverse().map((msg): UIMessage => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts as UIMessage['parts'],
    })),
    question,
  ];

  const context = retrievedDocs
    .map((doc) => {
      const content = doc.pageContent || '';
      return `${content}\nPage Number: ${doc.metadata?.pageNumber}`;
    })
    .join('\n\n');

  // Create system prompt using the template
  const systemPrompt = chatPrompt(context, language);

  // Generate response using AI SDK. Stop in the browser closes the request,
  // and req.signal then stops Gemini too.
  const result = streamText({
    model,
    instructions: systemPrompt,
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
        // nothing was shown, nothing to save
        if (!textOf(responseMessage).trim()) return;
        try {
          await db.message.createMany({
            data: [
              {
                id: question.id,
                role: 'user',
                // Parts are plain JSON data; the cast only tells TypeScript
                // they fit Prisma's Json type.
                parts: question.parts as Prisma.InputJsonValue,
                userId: user.id,
                fileId,
                createdAt: askedAt,
              },
              {
                id: responseMessage.id,
                role: 'assistant',
                parts: responseMessage.parts as Prisma.InputJsonValue,
                userId: user.id,
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

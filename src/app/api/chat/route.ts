import { mistral } from '@ai-sdk/mistral';
import { currentUser } from '@clerk/nextjs/server';
import { PineconeStore } from '@langchain/pinecone';
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai';
import { NextRequest } from 'next/server';

import { db } from '@/db';
import { embeddings } from '@/lib/embeddings';
import index from '@/lib/pinecone';
import { rateLimiter } from '@/lib/rateLimiter';
import { chatPrompt } from '@/lib/templates/chat-templates';

export const maxDuration = 60;

// Create Mistral model instance
const model = mistral('mistral-large-latest');

export const POST = async (req: NextRequest) => {
  const {
    messages,
    fileId,
    language,
  }: { messages: UIMessage[]; fileId: string; language: string } =
    await req.json();

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

  // Get last message
  const lastMessage = messages[messages.length - 1];

  const textParts = lastMessage.parts.filter(
    (part): part is { type: 'text'; text: string } => part.type === 'text'
  );

  // Grab the last text part's text
  const messageText = textParts.at(-1)?.text || '';

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
      take: 6,
    }),
  ]);

  // Re-order to chronological
  const formattedPrevMessages = prevMessagesList
    .slice()
    .reverse()
    .map((msg) => ({
      role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }));

  const context = retrievedDocs
    .map((doc) => {
      const content = doc.pageContent || '';
      return `${content}\nPage Number: ${doc.metadata?.pageNumber}`;
    })
    .join('\n\n');

  const chatHistory = formattedPrevMessages
    .map((message) => {
      if (message.role === 'user') return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })
    .join('');

  // Create system prompt using the template
  const systemPrompt = chatPrompt(context, chatHistory, language);

  // Generate response using AI SDK
  const result = streamText({
    model,
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    maxOutputTokens: 512,
    temperature: 0.3,
    abortSignal: req.signal,
    onFinish: async ({ text: generatedText }) => {
      try {
        await db.$transaction([
          db.message.create({
            data: {
              text: messageText,
              isUserMessage: true,
              userId: user.id,
              fileId,
            },
          }),
          db.message.create({
            data: {
              text: generatedText,
              isUserMessage: false,
              fileId,
              userId: user.id,
            },
          }),
        ]);
      } catch (error) {
        console.error('Error in onFinish callback:', error);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: ({ stream }) => consumeStream({ stream }),
  });
};

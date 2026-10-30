import { createGoogleGenerativeAI } from '@ai-sdk/google';
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

// Create Gemini model instance
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
const model = google('gemini-3.6-flash');

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

  // Saves the user's question and the AI's answer (full or partial).
  const saveExchange = async (aiText: string) => {
    // Create user message first
    await db.message.create({
      data: {
        text: messageText,
        isUserMessage: true,
        userId: user.id,
        fileId,
      },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 1));

    // Then create AI response
    await db.message.create({
      data: {
        text: aiText,
        isUserMessage: false,
        fileId,
        userId: user.id,
      },
    });
  };

  // Text received so far. The AI SDK does not call onFinish when a response
  // is cancelled, so we collect the text ourselves to save it in onAbort.
  let partialText = '';

  // Generate response using AI SDK
  const result = streamText({
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 512,
    temperature: 0.3,
    abortSignal: req.signal,
    onChunk: ({ chunk }) => {
      if (chunk.type === 'text-delta') partialText += chunk.text;
    },
    onFinish: async ({ text: generatedText }) => {
      try {
        await saveExchange(generatedText);
      } catch (error) {
        console.error('Error in onFinish callback:', error);
      }
    },
    // Runs when the user presses Stop (or the connection closes).
    // Keep what the user already saw so reloading the page matches the chat.
    onAbort: async () => {
      if (!partialText.trim()) return; // nothing was shown, nothing to save
      try {
        await saveExchange(partialText);
      } catch (error) {
        console.error('Error in onAbort callback:', error);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: ({ stream }) => consumeStream({ stream }),
  });
};

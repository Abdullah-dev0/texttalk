import { mistral } from '@ai-sdk/mistral';
import { currentUser } from '@clerk/nextjs/server';
import { PineconeStore } from '@langchain/pinecone';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
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

  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const messageText =
    lastMessage.parts.find((part) => part.type === 'text')?.text || '';

  // Save user message to database
  await db.message.create({
    data: {
      text: messageText,
      isUserMessage: true,
      userId: user.id,
      fileId,
    },
  });

  // Get vector store and search for relevant documents
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: file.id,
  });

  const retrievedDocs = await vectorStore.similaritySearch(messageText, 3);

  // Get recent messages for context
  const prevMessages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: 'asc' },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
    content: msg.text,
  }));

  const context = retrievedDocs
    .map(
      (doc) => `${doc.pageContent}\nPage Number: ${doc.metadata?.pageNumber}`
    )
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
    onFinish: async ({ text: generatedText }) => {
      try {
        await db.message.create({
          data: {
            text: generatedText,
            isUserMessage: false,
            fileId,
            userId: user.id,
          },
        });
      } catch (error) {
        console.error('Error in onFinish callback:', error);
      }
    },
  });

  return result.toUIMessageStreamResponse();
};

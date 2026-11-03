'use server';

import { auth } from '@clerk/nextjs/server';
import type { UIMessage } from 'ai';

import { db } from '@/db';

// A chat message as useChat sees it. Saved messages carry their time in metadata.
export type ChatMessage = UIMessage<{ createdAt?: string }>;

export type MessagesPage = {
  items: ChatMessage[];
  cursor?: string; // for pagination
};

export async function getMessages({
  fileId,
  before,
  take = 10,
}: {
  fileId: string;
  before?: string;
  take?: number;
}): Promise<MessagesPage> {
  const { userId } = await auth();

  if (!userId) throw new Error('Unauthorized');

  // Ensure user owns this file
  const file = await db.file.findFirst({ where: { id: fileId, userId } });
  if (!file) throw new Error('File not found or unauthorized');

  const where = {
    fileId,
    ...(before ? { createdAt: { lt: new Date(before) } } : {}),
  };

  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
  });

  return {
    items: messages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts as ChatMessage['parts'],
      metadata: { createdAt: m.createdAt.toISOString() },
    })),
    cursor:
      messages.length === take
        ? messages[messages.length - 1]?.createdAt.toISOString()
        : undefined,
  };
}

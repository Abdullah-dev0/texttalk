'use server';

import { auth } from '@clerk/nextjs/server';

import { db } from '@/db';

export type MessageDTO = {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  fileId: string;
};

export type MessagesPage = {
  items: MessageDTO[];
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
    items: messages.map((m: { id: string; text: string; isUserMessage: boolean; createdAt: Date; updatedAt: Date; userId: string; fileId: string }): MessageDTO => ({
      id: m.id,
      text: m.text,
      isUserMessage: m.isUserMessage,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      userId: m.userId ?? null,
      fileId: m.fileId,
    })),
    cursor:
      messages.length === take
        ? messages[messages.length - 1]?.createdAt.toISOString()
        : undefined,
  };
}

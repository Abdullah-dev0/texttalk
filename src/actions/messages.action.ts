'use server';

import { auth } from '@clerk/nextjs/server';
import type { Prisma } from '@prisma/client';

import { db } from '@/db';

export type MessageDTO = {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: string; // ISO string for client serialization
  updatedAt: string; // ISO string for client serialization
  userId: string | null;
  fileId: string;
};

export type MessagesPage = {
  items: MessageDTO[];
  nextCursor?: string; // pass as `cursor` to load the next (older) page
};
export type MessagesChunk = {
  items: MessageDTO[];
  hasMore: boolean;
  nextCursor?: string; // createdAt ISO of the oldest item returned
  total?: number; // total count for simple pagination
};

export async function getMessagesChunk({
  fileId,
  before, // ISO string; fetch messages with createdAt < before
  take = 4,
}: {
  fileId: string;
  before?: string;
  take?: number;
}): Promise<MessagesChunk> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  if (!fileId) throw new Error('File ID is required');
  if (!take || take < 1) throw new Error('take must be positive');

  const file = await db.file.findFirst({ where: { id: fileId, userId } });
  if (!file) throw new Error('File not found or unauthorized');

  const where: Prisma.MessageWhereInput = { fileId };
  if (before) {
    const d = new Date(before);
    if (!isNaN(d.getTime())) where.createdAt = { lt: d };
  }

  const results = await db.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: take + 1, // fetch one extra to determine hasMore
  });

  const hasMore = results.length > take;
  const slice = hasMore ? results.slice(0, take) : results;

  const itemsDesc = slice;
  const itemsAsc = itemsDesc
    .slice()
    .reverse()
    .map((m) => ({
      id: m.id,
      text: m.text,
      isUserMessage: m.isUserMessage,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      userId: m.userId ?? null,
      fileId: m.fileId,
    }));

  const nextCursor = itemsAsc[0]?.createdAt; // oldest in this batch

  return { items: itemsAsc, hasMore, nextCursor };
}

export async function getMessagesSimple({
  fileId,
  skip = 0,
  take = 10,
}: {
  fileId: string;
  skip?: number;
  take?: number;
}): Promise<MessagesChunk> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  if (!fileId) throw new Error('File ID is required');
  if (!take || take < 1) throw new Error('take must be positive');

  const file = await db.file.findFirst({ where: { id: fileId, userId } });
  if (!file) throw new Error('File not found or unauthorized');

  // Get total count for pagination info
  const total = await db.message.count({ where: { fileId } });

  const messages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  const hasMore = skip + take < total;

  const items = messages.map((m) => ({
    id: m.id,
    text: m.text,
    isUserMessage: m.isUserMessage,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    userId: m.userId,
    fileId: m.fileId,
  }));

  return { items, hasMore, total };
}

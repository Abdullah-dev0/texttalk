'use server';

import { auth } from '@clerk/nextjs/server';
import { UTApi } from 'uploadthing/server';

import { db } from '@/db';

// Get all user files
export async function getUserFiles() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const files = await db.file.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: files };
  } catch (error) {
    console.error('Error fetching files:', error);
    throw new Error('Failed to fetch files');
  }
}

// Get file upload status
export async function getFileUploadStatus(fileId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (!fileId) {
    throw new Error('File ID is required');
  }

  try {
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return { success: true, data: file };
  } catch (error) {
    console.error('Error fetching file upload status:', error);
    throw new Error('Failed to fetch upload status');
  }
}

// Get file by key
export async function getFileByKey(key: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (!key) {
    throw new Error('File key is required');
  }

  try {
    const file = await db.file.findFirst({
      where: {
        key,
        userId,
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return { success: true, data: file };
  } catch (error) {
    console.error('Error fetching file:', error);
    throw new Error('Failed to fetch file');
  }
}

// Delete file
export async function deleteFile(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (!id) {
    throw new Error('File ID is required');
  }

  try {
    // First, check if the file belongs to the user
    const file = await db.file.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!file) {
      throw new Error('File not found or unauthorized');
    }

    // Then delete the file
    await db.file.delete({
      where: {
        id,
      },
    });
    const utapi = new UTApi();

    await utapi.deleteFiles(file.key);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Ghost, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';

import { getUserFiles } from '@/actions/files.action';

import DeleteFile from './DeleteFile';
import LoadingFiles from './LoadingFiles';

interface FileType {
  id: string;
  name: string;
  uploadStatus: string;
  url: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
}

export default function FilesCard() {
  const {
    data: files,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FileType[]>({
    queryKey: ['user-files'],
    queryFn: async () => {
      const res = await getUserFiles();
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  if (isLoading) return <LoadingFiles />;

  if (isError) {
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <Ghost className="h-8 w-8 text-red-500" />
        <h3 className="font-semibold text-xl">Something went wrong</h3>
        <p className="text-red-500">
          {error instanceof Error ? error.message : 'Failed to load files'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!files?.length) {
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <Ghost className="h-8 w-8 text-zinc-800" />
        <h3 className="font-semibold text-xl">Pretty empty around here</h3>
        <p>Let&apos;s upload your first PDF.</p>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <li
          key={file.id}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm transition hover:shadow-lg"
        >
          <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
            <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="flex-1 truncate">
                <h3 className="truncate text-lg font-medium text-zinc-900">
                  {file.name}
                </h3>
              </div>
            </div>
          </Link>

          <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {format(new Date(file.createdAt), 'MMM yyyy')}
            </div>

            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              mocked
            </div>

            <DeleteFile id={file.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}

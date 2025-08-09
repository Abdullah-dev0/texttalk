import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteFile } from '@/actions/files.action';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

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

type DeleteFileProps = {
  id: string;
  className?: string;
};

export default function DeleteFile({ id, className }: DeleteFileProps) {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await deleteFile(fileId);
    },
    onSuccess: () => {
      // Optimistically update cache by removing the deleted file
      queryClient.setQueryData(
        ['user-files'],
        (oldFiles: FileType[] | undefined) => {
          if (!oldFiles) return [];
          return oldFiles.filter((file) => file.id !== id);
        }
      );
      toast.success('File deleted successfully');
    },
    onMutate: async () => {
      setCurrentlyDeletingFile(id);

      await queryClient.cancelQueries({ queryKey: ['user-files'] });

      const previousFiles = queryClient.getQueryData<FileType[]>([
        'user-files',
      ]);

      queryClient.setQueryData(
        ['user-files'],
        (oldFiles: FileType[] | undefined) => {
          if (!oldFiles) return [];
          return oldFiles.filter((file) => file.id !== id);
        }
      );

      return { previousFiles };
    },
    onSettled: () => {
      setCurrentlyDeletingFile(null);
    },
    onError: (error: Error, variables, context) => {
      // Rollback the optimistic update on error
      if (context?.previousFiles) {
        queryClient.setQueryData(['user-files'], context.previousFiles);
      }
      toast.error('Failed to delete file', {
        description: error.message || 'Please try again later',
      });
    },
  });

  const handleDeleteFile = () => {
    deleteFileMutation.mutate(id);
  };

  return (
    <Button
      onClick={handleDeleteFile}
      size="sm"
      disabled={deleteFileMutation.isPending}
      className={cn('w-full', className)}
      variant="destructive"
    >
      {currentlyDeletingFile === id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash className="h-4 w-4" />
      )}
    </Button>
  );
}

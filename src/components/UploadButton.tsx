'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UploadDropzone } from '@/lib/uploadthing';

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit ml-auto">Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">Upload Your File</DialogTitle>
          <DialogDescription className="text-base">
            Upload your document to get started with AI-powered conversations.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 mb-4 flex justify-center">
          <UploadDropzone
            endpoint="FileUploader"
            onClientUploadComplete={(res) => {
              toast.success('Upload Completed', {
                description: `Your file has been uploaded successfully. Size ${(res[0].size / 1024 / 1024).toFixed(2)} MB.`,
              });
              setIsOpen(false);
              queryClient.invalidateQueries({ queryKey: ['user-files'] });
            }}
            onUploadError={(error: Error) => {
              toast.error(`ERROR! ${error.message}`);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;

import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

import PdfRenderer from '@/components/PdfRenderer';
import ChatComponent from '@/components/chat/ChatComponent';
import { Button } from '@/components/ui/button';
import { db } from '@/db';
interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params;

  const user = await auth();

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.userId,
    },
  });

  if (!file)
    return (
      <div className="flex flex-col justify-center gap-4 items-center h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold">
            Oops! We couldn&apos;t find the file you&apos;re looking for.
          </h2>
          <p className="text-gray-500">
            It might have been moved or deleted. Please check your files or try
            again later.
          </p>
        </div>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-4">
        <div className="flex-1 xl:flex">
          <div className="flex-1 px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className="flex-1 border-t border-gray-200 lg:border-l lg:border-t-0">
          <ChatComponent file={file} />
        </div>
      </div>
    </div>
  );
};

export default Page;

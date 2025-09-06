import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

  if (!user.userId) {
    redirect('/sign-in');
  }

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.userId,
    },
  });

  if (!file)
    return (
      <div className="flex flex-col justify-center gap-4 items-center h-[calc(100vh-3.5rem)] overflow-hidden">
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
    <div className="h-[calc(100vh-3.5rem)] ">
      <div className="mx-auto h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:overflow-hidden">
        {/* PDF Column */}
        <div className="flex-1 xl:flex overflow-hidden">
          <div className="flex-1  overflow-hidden">
            <PdfRenderer url={file.url} />
          </div>
        </div>
        {/* Chat Column (no outer scroll; inner ChatComponent handles its own) */}
        <div className="flex-1 border-t border-gray-200 lg:border-l lg:border-t-0 flex flex-col min-h-0">
          <ChatComponent file={file} />
        </div>
      </div>
    </div>
  );
};

export default Page;

import ChatLoadingSkeleton from '@/components/loading/ChatLoadingSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => {
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {/* Main area - PDF Renderer Skeleton */}
            <Skeleton className="w-full h-[calc(100vh-8rem)]" />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          {/* Chat Wrapper Skeleton */}
          <ChatLoadingSkeleton />
        </div>
      </div>
    </div>
  );
};

export default Loading;

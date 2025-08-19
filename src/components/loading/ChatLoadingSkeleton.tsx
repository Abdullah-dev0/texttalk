import { Skeleton } from '@/components/ui/skeleton';

interface ChatLoadingSkeletonProps {
  messageCount?: number;
}

export default function ChatLoadingSkeleton({ messageCount = 5 }: ChatLoadingSkeletonProps) {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {Array.from({ length: messageCount }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <Skeleton className="h-20 w-full mt-auto" />
    </div>
  );
}
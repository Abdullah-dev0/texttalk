import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LoadOlderMessagesButtonProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export default function LoadOlderMessagesButton({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LoadOlderMessagesButtonProps) {
  if (!hasNextPage) return null;

  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        aria-busy={isFetchingNextPage}
        title={
          isFetchingNextPage
            ? 'Loading older messages…'
            : 'Load older messages'
        }
      >
        {isFetchingNextPage ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
          </>
        ) : (
          'Load older messages'
        )}
      </Button>
    </div>
  );
}
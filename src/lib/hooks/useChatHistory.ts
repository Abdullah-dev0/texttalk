import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getMessages, type MessageDTO } from '@/actions/messages.action';

export function useChatHistory(fileId: string) {
  const {
    data: historyData,
    status: historyStatus,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refetch: fetchOlder,
  } = useInfiniteQuery(
    ['messages', fileId],
    ({ pageParam }) =>
      getMessages({
        fileId,
        before: pageParam,
        take: 6,
      }),
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );

  const historyFlat: MessageDTO[] = useMemo(() => {
    if (!historyData?.pages) return [];
    return historyData.pages
      .flatMap((page) => page.items)
      .reverse();
  }, [historyData]);

  return {
    historyFlat,
    historyStatus,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchOlder,
  };
}
'use client';

import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { File } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DefaultChatTransport } from 'ai';
import { ChevronLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  getMessages,
  type MessageDTO,
  type MessagesPage,
} from '@/actions/messages.action';

import { Button, buttonVariants } from '../ui/button';
import { Textarea } from '../ui/textarea';

import SelectLanguage from './SelectLanguage';
import MessageItem from './messages/MessageItem';

const ChatComponent = ({ file }: { file: File }) => {
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // Live chat
  const {
    messages: liveMessages,
    sendMessage,
    status: liveStatus,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
      setMessages([]);
    },
  });

  const {
    data: historyData,
    status: historyStatus,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refetch: fetchOlder,
  } = useInfiniteQuery(
    ['messages', file.id],
    ({ pageParam }) =>
      getMessages({
        fileId: file.id,
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
      .flatMap((page: MessagesPage) => page.items)
      .reverse();
  }, [historyData]);

  // Auto scroll when live messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [liveMessages, liveStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }
    sendMessage(
      { text: input },
      { body: { fileId: file.id, language: selectedLanguage } }
    );
    setInput('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading chat history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b bg-card p-4 flex justify-between items-center w-full">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <ChevronLeft className="h-6 w-6 mr-1" />
          <span className="text-lg">Back to Dashboard</span>
        </Link>
        <SelectLanguage
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchNextPage();
                }}
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
          )}

          {/* Error */}
          {historyStatus === 'error' && (
            <div className="text-center text-red-500">
              Failed to load history
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOlder()}
                className="ml-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* History Messages */}
          {historyFlat.map((message) => (
            <MessageItem
              key={`history-${message.id}`}
              message={message}
              user={user || null}
              isHistory
            />
          ))}

          {/* Live Messages */}
          {liveMessages.map((message, index) => (
            <MessageItem
              key={`live-${index}`}
              message={message}
              user={user || null}
              isHistory={false}
            />
          ))}

          {/* Empty state */}
          {historyFlat.length === 0 && liveMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                💬
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Ready to chat!
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Ask questions about your PDF in {selectedLanguage}.
              </p>
            </div>
          )}

          {/* Typing indicator */}
          {liveStatus === 'submitted' && (
            <div className="flex gap-4 justify-start mt-6">
              <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md">
                AI
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your PDF"
              disabled={
                liveStatus === 'streaming' || liveStatus === 'submitted'
              }
              className="flex-1 min-h-[80px] max-h-[200px] resize-none"
              rows={3}
            />
            <Button
              type="submit"
              disabled={
                liveStatus === 'streaming' ||
                !input.trim() ||
                liveStatus === 'submitted'
              }
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;

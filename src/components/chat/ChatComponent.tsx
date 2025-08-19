'use client';

import { useUser } from '@clerk/nextjs';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAutoScroll } from '@/lib/hooks/useAutoScroll';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { useLiveChat } from '@/lib/hooks/useLiveChat';
import type { File } from '@/types/database';

import { buttonVariants } from '../ui/button';

import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadOlderMessagesButton from './LoadOlderMessagesButton';
import MessageItem from './MessageItem';
import SelectLanguage from './SelectLanguage';
import TypingIndicator from './TypingIndicator';

const ChatComponent = ({ file }: { file: File }) => {
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const { user } = useUser();

  // Custom hooks
  const { liveMessages, sendMessage, liveStatus } = useLiveChat();
  const {
    historyFlat,
    historyStatus,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchOlder,
  } = useChatHistory(file.id);
  const messagesEndRef = useAutoScroll(liveMessages, liveStatus);

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

  const isInputDisabled = liveStatus === 'streaming' || liveStatus === 'submitted';

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
          <LoadOlderMessagesButton
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />

          {historyStatus === 'error' && <ErrorState onRetry={fetchOlder} />}

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
            <EmptyState selectedLanguage={selectedLanguage} />
          )}

          {/* Typing indicator */}
          {liveStatus === 'submitted' && <TypingIndicator />}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        disabled={isInputDisabled}
      />
    </div>
  );
};

export default ChatComponent;

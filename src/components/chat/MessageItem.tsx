'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

import { avatarStyles, messageStyles } from '@/lib/styles';
import { formatTime } from '@/lib/time-utils';
import { cn } from '@/lib/utils';

interface HistoryMessage {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: string;
}

interface LiveMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{ type: string; text?: string }>;
}

interface MessageItemProps {
  message: HistoryMessage | LiveMessage;
  user: {
    imageUrl?: string | null;
    firstName?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
  } | null;
  isHistory?: boolean;
}

const MessageItem = ({
  message,
  user,
  isHistory = false,
}: MessageItemProps) => {
  const isHistoryMessage = (
    msg: HistoryMessage | LiveMessage
  ): msg is HistoryMessage => {
    return 'isUserMessage' in msg;
  };

  const isUser = isHistoryMessage(message)
    ? message.isUserMessage
    : message.role === 'user';

  // Skip system messages
  if (!isHistoryMessage(message) && message.role === 'system') {
    return null;
  }

  const messageText = isHistoryMessage(message)
    ? message.text
    : Array.isArray(message.parts)
      ? message.parts
          .filter(
            (p): p is { type: 'text'; text: string } =>
              p.type === 'text' && typeof p.text === 'string'
          )
          .map((p) => p.text)
          .join('')
      : '';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className={avatarStyles.ai}>
          AI
        </div>
      )}

      <div className={cn(isUser ? messageStyles.user : messageStyles.assistant)}>
        <div
          className={`text-sm ${isUser ? 'text-white' : 'text-foreground'}`}
        >
          <ReactMarkdown className="prose prose-sm max-w-none [&_*]:break-words [&_p]:mb-2 [&_p:last-child]:mb-0">
            {messageText}
          </ReactMarkdown>
        </div>
        <div className="text-xs mt-2 opacity-70 text-muted-foreground">
          {isHistory && isHistoryMessage(message)
            ? formatTime(message.createdAt)
            : 'just now'}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 flex flex-col items-center">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.firstName || 'User'}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full shadow-md object-cover"
            />
          ) : (
            <div className={avatarStyles.user}>
              {user?.firstName?.[0] ||
                user?.emailAddresses?.[0]?.emailAddress[0]?.toUpperCase() ||
                'U'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;

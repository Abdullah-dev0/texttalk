'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

import { formatTime } from '@/lib/time-utils';

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
    : message.parts?.find((p) => p.type === 'text')?.text || '';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md">
          AI
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 shadow-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${isUser ? 'py-2' : 'py-3'}`}
      >
        <div
          className={`text-sm ${isUser ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
        >
          <ReactMarkdown className="prose prose-xl">
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
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md">
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

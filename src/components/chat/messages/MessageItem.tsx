'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

import type { ChatMessage } from '@/actions/messages.action';
import { formatTime } from '@/lib/time-utils';

interface MessageItemProps {
  // Saved and live messages have the same shape.
  message: ChatMessage;
  user: {
    imageUrl?: string | null;
    firstName?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
  } | null;
}

const MessageItem = ({ message, user }: MessageItemProps) => {
  // Skip system messages
  if (message.role === 'system') return null;

  const isUser = message.role === 'user';

  const messageText = message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');

  // Saved messages know their time; a live one has just been written.
  const createdAt = message.metadata?.createdAt;

  // The AI's reply exists (with its id) before its first word arrives;
  // "AI is thinking..." covers that time, so don't show an empty bubble.
  if (!isUser && !messageText) return null;

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md">
          AI
        </div>
      )}

      <div className="max-w-[75%] rounded-2xl px-4 py-3 shadow-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className={`text-sm ${isUser ? 'text-white' : 'text-foreground'}`}>
          <div className="prose prose-sm max-w-none [&_*]:break-words [&_p]:mb-2 [&_p:last-child]:mb-0">
            <ReactMarkdown>{messageText}</ReactMarkdown>
          </div>
        </div>
        <div className="text-xs mt-2 opacity-70 text-muted-foreground">
          {createdAt ? formatTime(createdAt) : 'just now'}
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

'use client';

import { useChat } from '@ai-sdk/react';
import { File } from '@prisma/client';
import { DefaultChatTransport } from 'ai';
import { ChevronLeft, Loader2, Send, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { useGetFileUploadStatus } from '@/hooks/useApi';

import { Button, buttonVariants } from '../ui/button';
import { Textarea } from '../ui/textarea';

import SelectLanguage from './SelectLanguage';

interface SimpleChatProps {
  file: File;
}

interface UploadStatusResponse {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
}

const ChatComponent = ({ file }: SimpleChatProps) => {
  const { data, isLoading, error } = useGetFileUploadStatus(file.id);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage(
        { text: input },
        {
          body: { fileId: file.id, language: selectedLanguage },
        }
      );
      setInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-zinc-500">Preparing your PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-center items-center">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-zinc-700">Failed to load file status</p>
        <p className="mt-1 text-sm text-zinc-500">
          {error instanceof Error && error.message.includes('not found')
            ? 'File not found. It may have been deleted.'
            : 'Please try refreshing the page.'}
        </p>
        <Link
          href="/dashboard"
          className={buttonVariants({
            variant: 'secondary',
            className: 'mt-4',
          })}
        >
          <ChevronLeft className="h-3 w-3 mr-1.5" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if ((data as UploadStatusResponse)?.status === 'PROCESSING') {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-zinc-500">Processing PDF...</p>
      </div>
    );
  }

  if ((data as UploadStatusResponse)?.status === 'FAILED') {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-center items-center">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-zinc-700">Failed to process PDF</p>
        <Link
          href="/dashboard"
          className={buttonVariants({
            variant: 'secondary',
            className: 'mt-4',
          })}
        >
          <ChevronLeft className="h-3 w-3 mr-1.5" />
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-zinc-50 flex flex-col max-w-8xl">
      <div className="border-b bg-white p-4 flex justify-between items-center w-full">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <ChevronLeft className="h-6 w-6 mr-1" />
          <span className="text-lg"> Back to Dashboard</span>
        </Link>
        <SelectLanguage
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Ready to chat!</h3>
            <p className="text-zinc-500">
              Ask a question about your PDF in {selectedLanguage}.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar/Emoji for AI (left side) */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                    🤖
                  </div>
                )}

                <div className="max-w-[80%] p-3 rounded-lg bg-white border shadow-sm break-words">
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <div key={index}>
                        <ReactMarkdown className="prose prose-sm max-w-none">
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Avatar/Emoji for User (right side) */}
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {status === 'submitted' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                🤖
              </div>
              <div className="bg-white border shadow-sm p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your PDF"
              disabled={status !== 'ready'}
              className="flex-1 min-h-[80px] max-h-[200px] resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="flex-shrink-0"
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

'use client';

import { useChat } from '@ai-sdk/react';
import { File } from '@prisma/client';
import { DefaultChatTransport } from 'ai';
import { ChevronLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { Button, buttonVariants } from '../ui/button';
import { Textarea } from '../ui/textarea';

import SelectLanguage from './SelectLanguage';

interface SimpleChatProps {
  file: File;
}

const ChatComponent = ({ file }: SimpleChatProps) => {
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: { fileId: file.id, language: selectedLanguage },
        }
      );
      setInput('');
    }
  };

  return (
    <div className="relative h-full bg-background flex flex-col">
      <div className="border-b bg-card p-4 flex justify-between items-center w-full">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Ready to chat!</h3>
            <p className="text-muted-foreground">
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
                  <div className="shrink-0 w-8 h-8 bg-primary/15 text-primary rounded-full flex items-center justify-center text-lg">
                    🤖
                  </div>
                )}

                <div className="max-w-[80%] p-3 rounded-lg bg-card border shadow-xs break-words">
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <div key={index}>
                        <ReactMarkdown className="prose max-w-none [&_*]:break-words">
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Avatar/Emoji for User (right side) */}
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg">
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
              <div className="shrink-0 w-8 h-8 bg-primary/15 text-primary rounded-full flex items-center justify-center text-lg">
                🤖
              </div>
              <div className="bg-card border shadow-xs p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your PDF"
              disabled={status === 'streaming' || status === 'submitted'}
              className="flex-1 min-h-[80px] max-h-[200px] resize-none"
              rows={3}
            />
            <Button
              type="submit"
              disabled={
                status === 'streaming' ||
                !input.trim() ||
                status === 'submitted'
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

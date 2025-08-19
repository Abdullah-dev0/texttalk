import { Send } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

export default function ChatInput({
  input,
  onInputChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  return (
    <div className="border-t bg-card p-4 shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ask about your PDF"
            disabled={disabled}
            className="flex-1 min-h-[80px] max-h-[200px] resize-none"
            rows={3}
          />
          <Button
            type="submit"
            disabled={disabled || !input.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
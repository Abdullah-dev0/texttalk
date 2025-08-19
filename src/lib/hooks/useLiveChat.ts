import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';

export function useLiveChat() {
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

  return {
    liveMessages,
    sendMessage,
    liveStatus,
    setMessages,
  };
}
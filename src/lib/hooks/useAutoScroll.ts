import { useEffect, useRef } from 'react';

export function useAutoScroll(liveMessages: unknown[], liveStatus: unknown) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [liveMessages, liveStatus]);

  return messagesEndRef;
}
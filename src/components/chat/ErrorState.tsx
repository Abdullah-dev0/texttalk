import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="text-center text-red-500">
      Failed to load history
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="ml-2"
      >
        Retry
      </Button>
    </div>
  );
}
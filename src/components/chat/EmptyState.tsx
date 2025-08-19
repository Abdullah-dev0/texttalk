import { avatarStyles } from '@/lib/styles';

interface EmptyStateProps {
  selectedLanguage: string;
}

export default function EmptyState({ selectedLanguage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={`${avatarStyles.large} mb-4`}>
        💬
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        Ready to chat!
      </h3>
      <p className="text-muted-foreground max-w-sm">
        Ask questions about your PDF in {selectedLanguage}.
      </p>
    </div>
  );
}
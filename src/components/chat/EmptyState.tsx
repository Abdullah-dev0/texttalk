interface EmptyStateProps {
  selectedLanguage: string;
}

export default function EmptyState({ selectedLanguage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
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
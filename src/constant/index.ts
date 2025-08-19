export interface Language {
  id: number;
  language: string;
}

export const languages: readonly Language[] = [
  {
    id: 1,
    language: 'urdu',
  },
  {
    id: 2,
    language: 'spanish',
  },
  {
    id: 3,
    language: 'english',
  },
  {
    id: 4,
    language: 'french',
  },
] as const;

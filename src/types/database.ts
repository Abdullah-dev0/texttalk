// Database model types derived from Prisma schema
export type File = {
  id: string;
  name: string;
  uploadStatus: 'PENDING' | 'PROCESSING' | 'FAILED' | 'SUCCESS';
  url: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type Message = {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  fileId: string;
};

export type User = {
  id: string;
  email: string;
  userId: string;
  image?: string;
};
// API utility functions to replace tRPC calls

export interface File {
  id: string;
  name: string;
  uploadStatus: 'PENDING' | 'PROCESSING' | 'FAILED' | 'SUCCESS';
  url: string;
  key: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// Get user files
export const getUserFiles = async (): Promise<File[]> => {
  const response = await fetch('/api/files/get', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }

  return response.json();
};

// Get a specific file by key
export const getFile = async (key: string): Promise<File> => {
  const response = await fetch(`/api/files?key=${encodeURIComponent(key)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  return response.json();
};

// Delete a file
export const deleteFile = async (id: string): Promise<void> => {
  const response = await fetch('/api/files/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
};

// Check upload status
export const checkUploadStatus = async (key: string): Promise<File> => {
  const response = await fetch(
    `/api/files/upload-status?key=${encodeURIComponent(key)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to check upload status: ${response.statusText}`);
  }

  return response.json();
};

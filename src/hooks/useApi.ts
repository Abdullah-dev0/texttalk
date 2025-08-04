import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const api = {
	async authCallback() {
		const response = await fetch("/api/auth/callback");
		if (!response.ok) {
			throw new Error("Failed to authenticate");
		}
		return response.json();
	},

	async getUserFiles() {
		const response = await fetch("/api/files");
		if (!response.ok) {
			throw new Error("Failed to fetch files");
		}
		return response.json();
	},

	async getFileUploadStatus(fileId: string) {
		const response = await fetch(`/api/files/upload-status?fileId=${fileId}`);
		if (!response.ok) {
			if (response.status === 404) {
				throw new Error("File not found");
			}
			throw new Error("Failed to fetch upload status");
		}
		return response.json();
	},

	async getFile(key: string) {
		const response = await fetch("/api/files/get", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key }),
		});
		if (!response.ok) {
			throw new Error("Failed to fetch file");
		}
		return response.json();
	},

	async deleteFile(id: string) {
		const response = await fetch("/api/files/delete", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id }),
		});
		if (!response.ok) {
			throw new Error("Failed to delete file");
		}
		return response.json();
	},

	async getFileMessages(fileId: string, cursor?: string, limit: number = 10) {
		const params = new URLSearchParams({ fileId, limit: limit.toString() });
		if (cursor) params.append("cursor", cursor);

		const response = await fetch(`/api/messages?${params}`);
		if (!response.ok) {
			throw new Error("Failed to fetch messages");
		}
		return response.json();
	},
};

// Custom hooks
export const useAuthCallback = () => {
	return useMutation({
		mutationFn: api.authCallback,
	});
};

export const useGetUserFiles = () => {
	return useQuery({
		queryKey: ["user-files"],
		queryFn: api.getUserFiles,
		staleTime: Infinity,
		retry: (failureCount, error: unknown) => {
			if (error instanceof Error && error.message === "unauthorized") return false;
			return failureCount < 3;
		},
	});
};

export const useGetFileUploadStatus = (fileId: string) => {
	return useQuery({
		queryKey: ["file-upload-status", fileId],
		queryFn: () => api.getFileUploadStatus(fileId),
		refetchInterval: (data: unknown, query) => {
			// Stop refetching if we have an error or if status is final
			if (
				query.state.error ||
				(data as { status?: string })?.status === "SUCCESS" ||
				(data as { status?: string })?.status === "FAILED"
			) {
				return false;
			}
			return 500;
		},
		retry: (failureCount, error: unknown) => {
			// Don't retry on 404 errors (file not found)
			if (error instanceof Error && (error.message.includes("not found") || error.message.includes("404"))) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

export const useGetFile = (options?: {
	onSuccess?: (file: Record<string, unknown>) => void;
	onError?: (error: Error) => void;
}) => {
	return useMutation({
		mutationFn: api.getFile,
		...options,
	});
};

export const useDeleteFile = (options?: {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	onMutate?: () => void;
	onSettled?: () => void;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: api.deleteFile,
		onSuccess: () => {
			// Invalidate and refetch user files
			queryClient.invalidateQueries({ queryKey: ["user-files"] });
			options?.onSuccess?.();
		},
		onError: options?.onError,
		onMutate: options?.onMutate,
		onSettled: options?.onSettled,
	});
};

export const useGetFileMessages = (fileId: string, limit: number = 10) => {
	return useQuery({
		queryKey: ["file-messages", fileId],
		queryFn: () => api.getFileMessages(fileId, undefined, limit),
		enabled: !!fileId,
	});
};

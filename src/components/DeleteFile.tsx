import { Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useDeleteFile } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

type DeleteFileProps = {
	id: string;
	className?: string;
};

export default function DeleteFile({ id, className }: DeleteFileProps) {
	const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);

	const deleteFileMutation = useDeleteFile({
		onSuccess: () => {
			toast.success("File deleted successfully", {
				description: `The file has been deleted successfully at ${new Date().toLocaleString()}`,
			});
		},
		onMutate: () => {
			setCurrentlyDeletingFile(id);
		},
		onSettled: () => {
			setCurrentlyDeletingFile(null);
		},
		onError: () => {
			toast.error("Failed to delete file", {
				description: "Please try again later",
			});
		},
	});

	const handleDeleteFile = () => {
		deleteFileMutation.mutate(id);
	};

	return (
		<Button onClick={handleDeleteFile} size="sm" className={cn("w-full", className)} variant="destructive">
			{currentlyDeletingFile === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
		</Button>
	);
}

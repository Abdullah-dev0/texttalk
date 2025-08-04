"use client";

import { UploadDropzone as Drop } from "@uploadthing/react";
import { useRouter } from "next/navigation";
import { RefObject, useRef, useState } from "react";
import { toast } from "sonner";

import { useGetFile } from "@/hooks/useApi";

import DeleteFile from "./DeleteFile";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

const UploadDropzone = ({ dialogTriggerRef }: { dialogTriggerRef: RefObject<HTMLButtonElement> }) => {
	const router = useRouter();
	const [isUploadComplete, setUploadIsComplete] = useState(false);

	const getFileMutation = useGetFile({
		onSuccess: (file) => {
			if (file.uploadStatus === "SUCCESS") {
				setUploadIsComplete(false);
				router.push(`/dashboard/${file.id}`);
				return;
			}

			if (file.uploadStatus === "FAILED") {
				setUploadIsComplete(false);
				toast.error("Something went wrong while processing your file", {
					description: "Your File was uploaded successfully but we couldn't process it delete and try again",
					duration: 12000,
					action: <DeleteFile className=" w-fit" id={file.id} />,
				});
				dialogTriggerRef.current?.click();
				return;
			}
		},
		onError: () => {
			setUploadIsComplete(false);
			toast.error("Something went wrong", {
				description: "Please try again later",
			});
			dialogTriggerRef.current?.click();
		},
	});

	const startPolling = async (key: string) => {
		const maxAttempts = 30; // Poll for up to 30 attempts (30 seconds if 1 second intervals)
		let attempts = 0;

		const pollFile = async (): Promise<void> => {
			attempts++;
			getFileMutation.mutate(key);

			// If still processing and haven't exceeded max attempts, poll again
			if (attempts < maxAttempts) {
				setTimeout(pollFile, 1000);
			} else {
				setUploadIsComplete(false);
				toast.error("Processing is taking longer than expected", {
					description: "Please check back later or try uploading again",
					duration: 10000,
				});
				dialogTriggerRef.current?.click();
			}
		};

		// Start polling
		setTimeout(pollFile, 1000);
	};

	return (
		<>
			{isUploadComplete ? (
				<div className="min-h-[400px] w-full flex flex-col items-center justify-center space-y-4 p-6">
					<div className="relative w-16 h-16">
						<div className="absolute inset-0 rounded-full border-4 border-gray-200" />
						<div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
					</div>
					<h3 className="text-2xl font-semibold text-gray-800">Processing your PDF</h3>
					<p className="text-gray-500 text-center max-w-md">
						This may take a moment depending on the file size. Please do not close this window.
					</p>
				</div>
			) : (
				// @ts-expect-error - UploadThing types are not compatible with React 19
				<Drop
					className="ut-label:text-lg text-white ut-allowed-content:ut-uploading:text-red-300"
					endpoint="FileUploader"
					onClientUploadComplete={(res: File[]) => {
						setUploadIsComplete(true);
						toast.success("File uploaded successfully");
						// Refresh files by reloading the page or using a state management solution
						startPolling(res[0].name);
					}}
					onUploadError={(error: Error) => {
						toast.error(`${error.message}`, {
							description:
								"The uploaded file exceeds the maximum allowed size. Please reduce the file size and try again.",
							duration: 9000,
						});
					}}
					onChange={(files: File[]) => {
						if (files.length > 1) {
							toast.error("You can only upload one file at a time", {
								description: "Please try to upload one file at a time",
							});
							return;
						}
					}}
				/>
			)}
		</>
	);
};

const UploadButton = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const dialogTriggerRef = useRef<HTMLButtonElement>(null);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(v) => {
				if (!v) {
					setIsOpen(v);
				}
			}}>
			<DialogTrigger ref={dialogTriggerRef} onClick={() => setIsOpen(true)} asChild>
				<Button>Upload PDF</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogTitle>Upload PDF</DialogTitle>
				<UploadDropzone dialogTriggerRef={dialogTriggerRef} />
			</DialogContent>
		</Dialog>
	);
};

export default UploadButton;

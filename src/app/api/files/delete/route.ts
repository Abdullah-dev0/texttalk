import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

export async function DELETE(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await req.json();

		if (!id) {
			return NextResponse.json({ error: "File ID is required" }, { status: 400 });
		}

		// First, check if the file belongs to the user
		const file = await db.file.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!file) {
			return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 });
		}

		// Delete associated messages first (should be handled by Cascade but being explicit)
		await db.message.deleteMany({
			where: {
				fileId: id,
			},
		});

		// Then delete the file
		await db.file.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({ success: true, message: "File deleted successfully" });
	} catch (error) {
		console.error("Error deleting file:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

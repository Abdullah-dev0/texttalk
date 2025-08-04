import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const fileId = searchParams.get("fileId");

		if (!fileId) {
			return NextResponse.json({ error: "FileId parameter is required" }, { status: 400 });
		}

		const file = await db.file.findFirst({
			where: {
				id: fileId,
				userId,
			},
		});

		if (!file) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		return NextResponse.json({
			id: file.id,
			status: file.uploadStatus,
		});
	} catch (error) {
		console.error("Error checking upload status:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

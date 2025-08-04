import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { key } = await req.json();

		if (!key) {
			return NextResponse.json({ error: "Key is required" }, { status: 400 });
		}

		const file = await db.file.findFirst({
			where: {
				key,
				userId,
			},
		});

		if (!file) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		return NextResponse.json(file);
	} catch (error) {
		console.error("Error fetching file:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wishText } = body;

    if (!wishText || typeof wishText !== "string" || !wishText.trim()) {
      return NextResponse.json(
        { error: "Please provide your Christmas wish" },
        { status: 400 }
      );
    }

    const sessionId = generateId();

    await db.insert(sessions).values({
      id: sessionId,
      christmasWish: wishText.trim(),
    });

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isValidEmail } from "@/lib/utils";

// This route now only saves the email to the session
// Actual email sending is handled by EmailJS on the client side
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, email } = body;

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Update session with email
    await db
      .update(sessions)
      .set({
        email,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving email:", error);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}

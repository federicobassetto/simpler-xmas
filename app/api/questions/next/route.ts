import { NextRequest, NextResponse } from "next/server";
import { generateNextQuestion } from "@/lib/agents";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const result = await generateNextQuestion(sessionId);

    if (result.done) {
      return NextResponse.json({ done: true });
    }

    return NextResponse.json({
      done: false,
      question: result.question,
    });
  } catch (error) {
    console.error("Error generating next question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}


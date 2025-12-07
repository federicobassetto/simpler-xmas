import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { generatePlan } from "@/lib/agents";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, questionId, answer } = body;

    if (!sessionId || !questionId || answer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the question exists
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Save the answer
    const valueJson = JSON.stringify(answer);
    await db.insert(answers).values({
      id: generateId(),
      questionId,
      valueJson,
    });

    // Check if this was the 5th question
    const allQuestions = await db.query.questions.findMany({
      where: eq(questions.sessionId, sessionId),
    });

    // Count how many questions have answers
    let answeredCount = 0;
    for (const q of allQuestions) {
      const existingAnswer = await db.query.answers.findFirst({
        where: eq(answers.questionId, q.id),
      });
      if (existingAnswer) {
        answeredCount++;
      }
    }

    // If we have 5 answered questions, generate the plan
    if (answeredCount >= 5) {
      try {
        await generatePlan(sessionId);
      } catch (planError) {
        console.error("Error generating plan:", planError);
        // Don't fail the answer request if plan generation fails
        // The plan page will retry
      }
      return NextResponse.json({ done: true });
    }

    return NextResponse.json({ done: false });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}


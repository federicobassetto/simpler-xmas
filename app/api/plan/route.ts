import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, dailyTasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generatePlan } from "@/lib/agents";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if plan already exists
    const existingTasks = await db.query.dailyTasks.findMany({
      where: eq(dailyTasks.sessionId, sessionId),
    });

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existingTasks.length > 0) {
      // Return existing plan
      const tasksDTO = existingTasks.map((task) => ({
        id: task.id,
        dayIndex: task.dayIndex,
        targetDate: task.targetDate.toISOString(),
        title: task.title,
        description: task.description,
        category: task.category,
        tags: task.tagsJson ? JSON.parse(task.tagsJson) : [],
        quoteText: task.quoteText,
        quoteAuthor: task.quoteAuthor,
        isCompleted: task.isCompleted,
      }));

      return NextResponse.json({
        summarySentence: session.summarySentence || "",
        tasks: tasksDTO,
      });
    }

    // Generate the plan
    const result = await generatePlan(sessionId);

    const tasksDTO = result.tasks.map((task) => ({
      id: task.id,
      dayIndex: task.dayIndex,
      targetDate: task.targetDate.toISOString(),
      title: task.title,
      description: task.description,
      category: task.category,
      tags: task.tagsJson ? JSON.parse(task.tagsJson) : [],
      quoteText: task.quoteText,
      quoteAuthor: task.quoteAuthor,
      isCompleted: task.isCompleted,
    }));

    return NextResponse.json({
      summarySentence: result.summarySentence,
      tasks: tasksDTO,
    });
  } catch (error) {
    console.error("Error fetching/generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}


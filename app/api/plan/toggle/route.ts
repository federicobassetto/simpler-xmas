import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyTasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { taskId, isCompleted } = await request.json();

    if (!taskId || typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "taskId and isCompleted are required" },
        { status: 400 }
      );
    }

    // Update the task completion status
    await db
      .update(dailyTasks)
      .set({ isCompleted })
      .where(eq(dailyTasks.id, taskId));

    return NextResponse.json({ success: true, isCompleted });
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

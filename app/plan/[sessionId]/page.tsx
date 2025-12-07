"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateShort, formatDateLong, isToday, isValidEmail } from "@/lib/utils";

interface DailyTask {
  id: string;
  dayIndex: number;
  targetDate: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  quoteText: string | null;
  quoteAuthor: string | null;
  isCompleted: boolean;
}

interface PlanData {
  summarySentence: string;
  tasks: DailyTask[];
}

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Email form state
  const [email, setEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plan?sessionId=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch plan");
        }

        setPlanData(data);

        // Find today's task or default to first task
        const today = new Date();
        const todayTask = data.tasks.find((task: DailyTask) => {
          const taskDate = new Date(task.targetDate);
          return isToday(taskDate);
        });

        setSelectedTask(todayTask || data.tasks[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [sessionId]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailSubmitting(true);
    setEmailError("");

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to save email");
      }

      setEmailSaved(true);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setEmailSubmitting(false);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <Spinner message="Creating your personalised plan..." />
        <p className="mt-4 text-sm text-warm-gray-light text-center max-w-sm">
          This may take a moment as we craft activities tailored to your wishes.
        </p>
      </main>
    );
  }

  if (error || !planData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <p className="text-warm-gray mb-4">
            {error || "Unable to load your plan"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-terracotta hover:underline"
          >
            Start over
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-forest-dark mb-4">
            Your Simpler Xmas plan
          </h1>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed">
            {planData.summarySentence}
          </p>
        </header>

        {/* Main content - two column layout on desktop */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Day cards grid - left side */}
          <div className="lg:col-span-3 mb-8 lg:mb-0">
            <h2 className="text-sm font-medium text-warm-gray-light uppercase tracking-wide mb-4">
              Your 14-day journey
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {planData.tasks
                .sort((a, b) => a.dayIndex - b.dayIndex)
                .map((task, index) => {
                  const taskDate = new Date(task.targetDate);
                  const isSelectedTask = selectedTask?.id === task.id;
                  const isTaskToday = isToday(taskDate);
                  const isComplete = completedTasks.has(task.id);

                  return (
                    <Card
                      key={task.id}
                      isSelected={isSelectedTask}
                      isClickable
                      onClick={() => setSelectedTask(task)}
                      className={`
                        p-4 relative overflow-hidden
                        animate-fade-in
                        ${isComplete ? "opacity-60" : ""}
                      `}
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                    >
                      {isTaskToday && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-terracotta rounded-full" />
                      )}
                      
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs font-medium text-warm-gray-light">
                          Day {task.dayIndex}
                        </span>
                        <span className="text-xs text-warm-gray-light">
                          {formatDateShort(taskDate)}
                        </span>
                      </div>

                      <h3
                        className={`
                          font-medium text-sm md:text-base text-forest-dark mb-2 line-clamp-2
                          ${isComplete ? "line-through" : ""}
                        `}
                      >
                        {task.title}
                      </h3>

                      <CategoryTag category={task.category} size="sm" />
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Today's focus panel - right side / sticky */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-sm font-medium text-warm-gray-light uppercase tracking-wide mb-4">
                {selectedTask && isToday(new Date(selectedTask.targetDate))
                  ? "Today's focus"
                  : "Selected activity"}
              </h2>

              {selectedTask && (
                <Card className="p-6 animate-fade-in">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-sm text-warm-gray-light">
                      Day {selectedTask.dayIndex}
                    </span>
                    <span className="text-sm text-warm-gray-light">
                      {formatDateLong(new Date(selectedTask.targetDate))}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl md:text-2xl text-forest-dark mb-2">
                    {selectedTask.title}
                  </h3>

                  <div className="mb-4">
                    <CategoryTag category={selectedTask.category} size="md" />
                  </div>

                  <p className="text-warm-gray leading-relaxed mb-6">
                    {selectedTask.description}
                  </p>

                  {/* Tags */}
                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedTask.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-cream-dark text-warm-gray-light rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quote */}
                  {selectedTask.quoteText && (
                    <blockquote className="border-l-2 border-terracotta-light pl-4 py-2 mb-6">
                      <p className="text-sm italic text-warm-gray leading-relaxed">
                        "{selectedTask.quoteText}"
                      </p>
                      {selectedTask.quoteAuthor && (
                        <footer className="mt-2 text-xs text-warm-gray-light">
                          — {selectedTask.quoteAuthor}
                          <br />
                          <span className="text-[10px]">Quote from ZenQuotes.io</span>
                        </footer>
                      )}
                    </blockquote>
                  )}

                  {/* Mark as done */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={completedTasks.has(selectedTask.id)}
                      onChange={() => toggleTaskComplete(selectedTask.id)}
                      className="
                        w-5 h-5 rounded border-2 border-cream-dark
                        text-terracotta focus:ring-terracotta
                        cursor-pointer
                      "
                    />
                    <span className="text-sm text-warm-gray group-hover:text-forest-dark transition-colors">
                      Mark as done
                    </span>
                  </label>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Email capture section */}
        <section className="mt-16 max-w-xl mx-auto text-center animate-fade-in">
          <Card className="p-8">
            <h2 className="font-serif text-2xl text-forest-dark mb-2">
              Send this plan to your inbox
            </h2>
            <p className="text-sm text-warm-gray-light mb-6">
              Daily emails are a future feature. For now, your email is stored
              locally on this machine.
            </p>

            {emailSaved ? (
              <div className="text-forest py-4">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-forest"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p>Email saved! We'll let you know when daily reminders are ready.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="
                    w-full p-3
                    bg-cream rounded-xl
                    border border-cream-dark
                    text-warm-gray placeholder:text-warm-gray-light
                    transition-all duration-200
                    focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none
                  "
                  disabled={emailSubmitting}
                />
                {emailError && (
                  <p className="text-sm text-terracotta-dark">{emailError}</p>
                )}
                <PrimaryButton
                  type="submit"
                  isLoading={emailSubmitting}
                  disabled={!email.trim()}
                >
                  Save email
                </PrimaryButton>
              </form>
            )}
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-warm-gray-light">
          <p>
            Made with care for a calmer holiday season.{" "}
            <button
              onClick={() => router.push("/")}
              className="text-terracotta hover:underline"
            >
              Create another plan
            </button>
          </p>
        </footer>
      </div>
    </main>
  );
}


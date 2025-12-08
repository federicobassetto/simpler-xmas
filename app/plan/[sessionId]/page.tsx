"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Spinner } from "@/components/ui/Spinner";
import { AudioControl } from "@/components/AudioProvider";
import { formatDateShort, formatDateLong, isToday, isPast, isValidEmail } from "@/lib/utils";

// EmailJS configuration - set these in your environment variables
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

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

type EmailMode = "self" | "share";

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const formRef = useRef<HTMLFormElement>(null);

  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Email form state
  const [emailMode, setEmailMode] = useState<EmailMode>("self");
  const [email, setEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Share state
  const [shareSuccess, setShareSuccess] = useState("");

  const planUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plan?sessionId=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch plan");
        }

        setPlanData(data);

        // Initialize completedTasks from database
        const initialCompleted = new Set<string>(
          data.tasks
            .filter((task: DailyTask) => task.isCompleted)
            .map((task: DailyTask) => task.id)
        );
        setCompletedTasks(initialCompleted);

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

    if (emailMode === "share" && !senderName.trim()) {
      setEmailError("Please enter your name so they know who sent it");
      return;
    }

    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      setEmailError("Email service not configured. Please use the Share button instead.");
      return;
    }

    setEmailSubmitting(true);
    setEmailError("");

    try {
      const templateParams = {
        to_email: email,
        shared_by: emailMode === "share" ? `, shared by ${senderName}` : "",
        personal_message: emailMode === "share" ? (personalMessage || "") : "",
        plan_url: planUrl,
        summary: planData?.summarySentence || "Your personalised advent plan for a calmer Christmas",
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setEmailSent(true);
      setTimeout(() => {
        setEmail("");
        setSenderName("");
        setPersonalMessage("");
      }, 500);
    } catch (err) {
      console.error("EmailJS error:", err);
      setEmailError("Failed to send email. Please try using the Share button instead.");
    } finally {
      setEmailSubmitting(false);
    }
  };

  const resetEmailForm = () => {
    setEmailSent(false);
    setEmail("");
    setSenderName("");
    setPersonalMessage("");
    setEmailError("");
  };

  const toggleTaskComplete = async (taskId: string) => {
    const newIsCompleted = !completedTasks.has(taskId);
    
    // Optimistically update UI
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });

    // Persist to database
    try {
      const response = await fetch("/api/plan/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isCompleted: newIsCompleted }),
      });

      if (!response.ok) {
        // Revert on failure
        setCompletedTasks((prev) => {
          const next = new Set(prev);
          if (newIsCompleted) {
            next.delete(taskId);
          } else {
            next.add(taskId);
          }
          return next;
        });
      }
    } catch {
      // Revert on error
      setCompletedTasks((prev) => {
        const next = new Set(prev);
        if (newIsCompleted) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }
        return next;
      });
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: "My Simpler Xmas Plan",
      text: planData?.summarySentence || "Check out my personalised advent plan for a calmer Christmas!",
      url: shareUrl,
    };

    // Try native Web Share API first
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        setShareSuccess("Shared successfully!");
        setTimeout(() => setShareSuccess(""), 3000);
      } catch (err) {
        // User cancelled or error - fall back to copy
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess("Link copied to clipboard!");
      setTimeout(() => setShareSuccess(""), 3000);
    } catch {
      setShareSuccess("Failed to copy link");
      setTimeout(() => setShareSuccess(""), 3000);
    }
  };

  const handleBookmark = () => {
    // Modern browsers don't allow programmatic bookmarking for security reasons
    // Show instructions instead
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const shortcut = isMac ? "⌘+D" : "Ctrl+D";
    alert(`Press ${shortcut} to bookmark this page, or add it to your home screen on mobile!`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <Spinner message="Creating your personalised plan..." />
        <p className="mt-4 text-sm text-white/80 text-center max-w-sm">
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
      <AudioControl />
      <div className="max-w-6xl mx-auto">
        {/* Back to home button */}
        <button
          onClick={() => router.push("/")}
          className="
            group flex items-center gap-2 mb-6
            text-warm-gray hover:text-forest-dark
            transition-colors duration-200
            animate-fade-in
          "
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">Back to home</span>
        </button>

        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-forest-dark mb-4">
            Your Simpler Xmas plan
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
            {planData.summarySentence}
          </p>
        </header>

        {/* Share & Bookmark buttons */}
        <div className="flex justify-center gap-3 mb-8 animate-fade-in">
          <button
            onClick={handleShare}
            className="
              inline-flex items-center gap-2 px-4 py-2
              bg-white border border-cream-dark rounded-full
              text-sm text-warm-gray
              transition-all duration-200
              hover:border-terracotta hover:text-forest-dark
              focus:outline-none focus:ring-2 focus:ring-terracotta/20
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={handleBookmark}
            className="
              inline-flex items-center gap-2 px-4 py-2
              bg-white border border-cream-dark rounded-full
              text-sm text-warm-gray
              transition-all duration-200
              hover:border-terracotta hover:text-forest-dark
              focus:outline-none focus:ring-2 focus:ring-terracotta/20
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Bookmark
          </button>
          {shareSuccess && (
            <span className="inline-flex items-center px-3 py-1 bg-forest/10 text-forest text-sm rounded-full animate-fade-in">
              {shareSuccess}
            </span>
          )}
        </div>

        {/* Main content - two column layout on desktop, reversed on mobile */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Today's focus panel - shown first on mobile, right side on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-2 mb-8 lg:mb-0">
            <div id="task-detail" className="lg:sticky lg:top-8">
              <h2 className="text-sm font-medium text-white uppercase tracking-wide mb-4">
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

          {/* Day cards grid - shown second on mobile, left side on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <h2 className="text-sm font-medium text-white uppercase tracking-wide mb-4">
              Your 25-day advent journey
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {planData.tasks
                .sort((a, b) => a.dayIndex - b.dayIndex)
                .map((task, index) => {
                  const taskDate = new Date(task.targetDate);
                  const isSelectedTask = selectedTask?.id === task.id;
                  const isTaskToday = isToday(taskDate);
                  const isTaskPast = isPast(taskDate);
                  const isComplete = completedTasks.has(task.id);

                  return (
                    <Card
                      key={task.id}
                      isSelected={isSelectedTask}
                      isClickable
                      onClick={() => {
                        setSelectedTask(task);
                        // Scroll to detail on mobile
                        if (window.innerWidth < 1024) {
                          document.getElementById('task-detail')?.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                          });
                        }
                      }}
                      className={`
                        p-4 relative overflow-hidden
                        animate-fade-in
                        ${isTaskPast ? "!bg-cream/80" : ""}
                        ${isComplete ? "opacity-50" : ""}
                      `}
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                    >
                      {isTaskToday && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-terracotta rounded-full" />
                      )}
                      
                      <div className="flex items-baseline justify-between mb-2">
                        <span className={`text-xs font-medium ${isTaskPast ? "text-warm-gray-light/60" : "text-warm-gray-light"}`}>
                          Day {task.dayIndex}
                        </span>
                        <span className={`text-xs ${isTaskPast ? "text-warm-gray-light/60" : "text-warm-gray-light"}`}>
                          {formatDateShort(taskDate)}
                        </span>
                      </div>

                      <h3
                        className={`
                          font-medium text-sm md:text-base mb-2 line-clamp-2
                          ${isComplete ? "line-through text-warm-gray-light" : ""}
                          ${isTaskPast && !isComplete ? "text-warm-gray" : "text-forest-dark"}
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
        </div>

        {/* Email section */}
        <section className="mt-16 max-w-xl mx-auto text-center animate-fade-in">
          <Card className="p-8">
            <h2 className="font-serif text-2xl text-forest-dark mb-2">
              Send this plan via email
            </h2>
            <p className="text-sm text-warm-gray-light mb-6">
              Save your plan for later or share it with someone special.
            </p>

            {emailSent ? (
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
                <p className="mb-4">
                  {emailMode === "self" 
                    ? "Email sent! Check your inbox for the plan link."
                    : "Your plan has been shared!"}
                </p>
                <button
                  onClick={resetEmailForm}
                  className="text-sm text-terracotta hover:underline"
                >
                  Send another email
                </button>
              </div>
            ) : (
              <>
                {/* Mode toggle */}
                <div className="flex justify-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode("self");
                      setEmailError("");
                    }}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      transition-all duration-200
                      ${emailMode === "self"
                        ? "bg-terracotta text-white"
                        : "bg-cream-dark text-warm-gray hover:bg-sage hover:text-forest-dark"
                      }
                    `}
                  >
                    Send to myself
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode("share");
                      setEmailError("");
                    }}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      transition-all duration-200
                      ${emailMode === "share"
                        ? "bg-terracotta text-white"
                        : "bg-cream-dark text-warm-gray hover:bg-sage hover:text-forest-dark"
                      }
                    `}
                  >
                    Share with someone
                  </button>
                </div>

                <form ref={formRef} onSubmit={handleEmailSubmit} className="space-y-4">
                  {emailMode === "share" && (
                    <>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Your name"
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
                      <textarea
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Add a personal message (optional)"
                        rows={2}
                        className="
                          w-full p-3
                          bg-cream rounded-xl
                          border border-cream-dark
                          text-warm-gray placeholder:text-warm-gray-light
                          resize-none
                          transition-all duration-200
                          focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none
                        "
                        disabled={emailSubmitting}
                      />
                    </>
                  )}
                  
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={emailMode === "self" ? "your@email.com" : "recipient@email.com"}
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
                    disabled={!email.trim() || (emailMode === "share" && !senderName.trim())}
                  >
                    {emailMode === "self" ? "Send to my inbox" : "Share plan"}
                  </PrimaryButton>
                </form>
              </>
            )}
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-white">
          <p>
            Made with care for a calmer holiday season by Ari and Fede.{" "}
            <button
              onClick={() => router.push("/")}
              className="text-white hover:underline"
            >
              Create another plan
            </button>
          </p>
        </footer>
      </div>
    </main>
  );
}

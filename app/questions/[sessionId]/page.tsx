"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { AudioControl } from "@/components/AudioProvider";

interface Question {
  id: string;
  index: number;
  text: string;
  inputType: "text" | "single-select" | "multi-select";
  options: string[] | null;
}

export default function QuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string | string[]>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState("");

  const fetchNextQuestion = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/questions/next?sessionId=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch question");
      }

      if (data.done) {
        // All questions answered, navigate to plan
        router.push(`/plan/${sessionId}`);
        return;
      }

      setQuestion(data.question);
      // Reset answer state based on input type
      if (data.question.inputType === "multi-select") {
        setAnswer([]);
      } else {
        setAnswer("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  const handleSubmit = async () => {
    if (!question) return;

    // Validate answer
    if (
      (typeof answer === "string" && !answer.trim()) ||
      (Array.isArray(answer) && answer.length === 0)
    ) {
      setError("Please provide an answer before continuing.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // If this is the 5th question, show the generating plan view
    const isFinalQuestion = question.index === 5;
    if (isFinalQuestion) {
      setIsGeneratingPlan(true);
    }

    try {
      const response = await fetch("/api/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save answer");
      }

      if (data.done) {
        // All questions answered, navigate to plan
        router.push(`/plan/${sessionId}`);
      } else {
        // Fetch next question
        await fetchNextQuestion();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsGeneratingPlan(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  const handleSingleSelect = (option: string) => {
    setAnswer(option);
  };

  const handleMultiSelect = (option: string) => {
    const currentAnswers = answer as string[];
    if (currentAnswers.includes(option)) {
      setAnswer(currentAnswers.filter((a) => a !== option));
    } else {
      setAnswer([...currentAnswers, option]);
    }
  };

  const isAnswerValid = () => {
    if (typeof answer === "string") {
      return answer.trim().length > 0;
    }
    return answer.length > 0;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <Spinner message="Preparing your next question..." />
      </main>
    );
  }

  if (isGeneratingPlan) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md mx-auto text-center animate-fade-in">
          {/* Animated gift/calendar icon */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto relative">
              {/* Spinning outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-cream-dark border-t-terracotta animate-spin" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-forest-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Main message */}
          <h2 className="font-serif text-2xl md:text-3xl text-forest-dark mb-4">
            Creating your personalized calendar
          </h2>

          {/* Time estimate */}
          <p className="text-white mb-6 leading-relaxed">
            We&apos;re crafting 25 unique activities just for you.
            <br />
            This usually takes <span className="font-semibold text-white">1–2 minutes</span>.
          </p>

          {/* Gentle reminder */}
          <p className="text-white/80 text-sm mb-8">
            Please don&apos;t leave this page while we work our magic ✨
          </p>

          {/* Animated dots */}
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <p className="text-warm-gray mb-4">Something went wrong.</p>
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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <AudioControl />
      <div className="w-full max-w-xl mx-auto animate-fade-in bg-cream border border-terracotta/40 rounded-sm shadow-sm p-8 md:p-12">
        {/* Progress bar */}
        <div className="mb-8">
          <ProgressBar current={question.index} total={5} />
        </div>

        {/* Question */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-3xl text-forest-dark leading-snug">
            {question.text}
          </h1>
        </div>

        {/* Answer input */}
        <div className="space-y-4">
          {question.inputType === "text" && (
            <textarea
              value={answer as string}
              onChange={handleTextChange}
              placeholder="Share your thoughts..."
              className="
                w-full h-32 p-4
                bg-white rounded-2xl
                border border-cream-dark
                text-warm-gray placeholder:text-warm-gray-light
                resize-none
                transition-all duration-200
                focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none
              "
              disabled={isSubmitting}
            />
          )}

          {question.inputType === "single-select" && question.options && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSingleSelect(option)}
                  disabled={isSubmitting}
                  className={`
                    w-full text-left p-4
                    rounded-xl
                    border-2 transition-all duration-200
                    ${
                      answer === option
                        ? "border-terracotta bg-terracotta/5 text-forest-dark"
                        : "border-cream-dark bg-white text-warm-gray hover:border-terracotta-light"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${
                          answer === option
                            ? "border-terracotta"
                            : "border-warm-gray-light"
                        }
                      `}
                    >
                      {answer === option && (
                        <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                      )}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          )}

          {question.inputType === "multi-select" && question.options && (
            <div className="space-y-3">
              <p className="text-sm text-warm-gray-light">
                Select all that apply
              </p>
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const isSelected = (answer as string[]).includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMultiSelect(option)}
                      disabled={isSubmitting}
                      className={`
                        px-4 py-2
                        rounded-full
                        border-2 transition-all duration-200
                        ${
                          isSelected
                            ? "border-terracotta bg-terracotta text-white"
                            : "border-cream-dark bg-white text-warm-gray hover:border-terracotta-light"
                        }
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-terracotta-dark text-sm text-center">
            {error}
          </p>
        )}

        {/* Submit button */}
        <div className="flex justify-center mt-8">
          <PrimaryButton
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!isAnswerValid()}
          >
            {question.index === 5 ? "Generate my plan" : "Continue"}
          </PrimaryButton>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-warm-gray-light hover:text-warm-gray transition-colors"
          >
            ← Start over
          </button>
        </div>
      </div>
    </main>
  );
}


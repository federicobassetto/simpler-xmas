"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";

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
      <div className="w-full max-w-xl mx-auto animate-fade-in">
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


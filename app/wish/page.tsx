"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AudioControl } from "@/components/AudioProvider";

const EXAMPLE_WISHES = [
  "Less rushing and more quiet dinners.",
  "To feel connected with loved ones.",
  "To spend more time in nature.",
  "A holiday season that doesn't leave me exhausted.",
  "More presence, less pressure.",
];

export default function WishPage() {
  const router = useRouter();
  const [wish, setWish] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wish.trim()) {
      setError("Please share your wish before continuing.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishText: wish.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      router.push(`/questions/${data.sessionId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <AudioControl />
      <div className="w-full max-w-xl mx-auto animate-fade-in-up bg-cream border border-terracotta/40 rounded-sm shadow-sm p-8 md:p-12">
        {/* Heading */}
        <h1 className="font-serif text-3xl md:text-4xl text-forest-dark mb-3 text-center">
          For Christmas I would like to…
        </h1>
        
        <p className="text-warm-gray-light text-center mb-8">
          Share what you're hoping for this holiday season, in your own words.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Textarea */}
          <div>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="Write freely about what you'd like this Christmas to feel like..."
              className="
                w-full h-40 p-4
                bg-white rounded-2xl
                border border-cream-dark
                text-warm-gray placeholder:text-warm-gray-light
                resize-none
                transition-all duration-200
                focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none
              "
              disabled={isLoading}
            />
          </div>

          {/* Example suggestions */}
          <div className="space-y-2">
            <p className="text-sm text-warm-gray-light">
              Need inspiration? Try something like:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_WISHES.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setWish(example)}
                  className="
                    text-sm px-3 py-1.5
                    bg-cream-dark text-warm-gray
                    rounded-full
                    transition-all duration-200
                    hover:bg-sage hover:text-forest-dark
                    focus:outline-none focus:ring-2 focus:ring-terracotta
                  "
                  disabled={isLoading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-terracotta-dark text-sm text-center">{error}</p>
          )}

          {/* Submit button */}
          <div className="flex justify-center pt-4">
            <PrimaryButton
              type="submit"
              isLoading={isLoading}
              disabled={!wish.trim()}
            >
              Continue
            </PrimaryButton>
          </div>
        </form>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-warm-gray-light hover:text-warm-gray transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </main>
  );
}

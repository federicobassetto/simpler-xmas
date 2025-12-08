"use client";

import { useRouter } from "next/navigation";
import { useAudio, AudioControl } from "@/components/AudioProvider";

export default function Home() {
  const router = useRouter();
  const { startAudio } = useAudio();

  const handleBegin = () => {
    // Start the ambient music on user interaction
    startAudio();
    router.push("/wish");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <AudioControl />

      <div className="max-w-2xl mx-auto text-center animate-fade-in-up border border-terracotta/40 p-12 bg-cream rounded-sm shadow-sm">
        {/* Main heading */}
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-forest-dark mb-6 leading-tight">
          A Simpler Xmas
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-warm-gray mb-4 leading-relaxed max-w-lg mx-auto">
          25 days of small, kind moments for a calmer Christmas.
        </p>

        <p className="text-base text-warm-gray-light mb-12 max-w-md mx-auto">
          Create your personalised advent-style calendar for a more mindful, 
          less stressful holiday season.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleBegin}
          className="
            inline-flex items-center justify-center
            px-10 py-4
            bg-terracotta text-white
            font-medium text-lg
            rounded-full
            transition-all duration-200 ease-out
            hover:bg-terracotta-dark hover:scale-[1.02]
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta
          "
        >
          Begin
        </button>

        {/* Small note */}
        <p className="mt-8 text-sm text-warm-gray-light">
          Takes about 5 minutes · Free · No account needed
        </p>
      </div>

      {/* Decorative bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-terracotta-light to-transparent opacity-30" />
    </main>
  );
}

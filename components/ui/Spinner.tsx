"use client";

interface SpinnerProps {
  message?: string;
}

export function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-2 border-cream-dark" />
        {/* Spinning arc */}
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-terracotta animate-spin" />
      </div>
      {message && (
        <p className="text-warm-gray-light text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}


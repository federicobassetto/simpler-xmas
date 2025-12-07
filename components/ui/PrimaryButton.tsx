"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

export function PrimaryButton({
  children,
  isLoading = false,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    px-8 py-3
    font-medium text-lg
    rounded-full
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-terracotta text-white
      hover:bg-terracotta-dark hover:scale-[1.02]
      active:scale-[0.98]
    `,
    secondary: `
      bg-cream-dark text-warm-gray
      border border-warm-gray-light
      hover:bg-cream hover:border-warm-gray
      active:scale-[0.98]
    `,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}


"use client";

import { categoryConfig } from "@/lib/utils";

interface CategoryTagProps {
  category: string;
  size?: "sm" | "md";
}

export function CategoryTag({ category, size = "sm" }: CategoryTagProps) {
  const config = categoryConfig[category] || {
    label: category,
    color: "bg-cream-dark text-warm-gray",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`
        inline-block rounded-full font-medium
        ${config.color}
        ${sizeStyles[size]}
      `}
    >
      {config.label}
    </span>
  );
}


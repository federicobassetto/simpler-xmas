"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isClickable?: boolean;
  style?: React.CSSProperties;
}

export function Card({
  children,
  className = "",
  onClick,
  isSelected = false,
  isClickable = false,
  style,
}: CardProps) {
  const baseStyles = `
    bg-white rounded-2xl
    shadow-sm
    transition-all duration-200 ease-out
  `;

  const interactiveStyles = isClickable
    ? `
      cursor-pointer
      hover:shadow-md hover:scale-[1.01]
      active:scale-[0.99]
    `
    : "";

  const selectedStyles = isSelected
    ? "ring-2 ring-terracotta shadow-md"
    : "";

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${selectedStyles} ${className}`}
      style={style}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}


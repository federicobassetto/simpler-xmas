import { customAlphabet } from "nanoid";

// Generate CUID-like IDs
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 21);

export function generateId(): string {
  return nanoid();
}

/**
 * Calculate 25 days from December 1st to December 25th of the current year
 * If we're past December 25th, use next year's dates
 */
export function getAdventDates(): Date[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // December 1st of current year
  let startDate = new Date(currentYear, 11, 1); // Month is 0-indexed
  
  // If we're past December 25th, use next year
  const christmas = new Date(currentYear, 11, 25);
  if (now > christmas) {
    startDate = new Date(currentYear + 1, 11, 1);
  }
  
  const dates: Date[] = [];
  for (let i = 0; i < 25; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format a date for display (e.g., "Dec 12")
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format a date for display (e.g., "December 12, 2024")
 */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past (before today)
 */
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

/**
 * Simple email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Category display names and colors
 */
export const categoryConfig: Record<string, { label: string; color: string }> = {
  "self-care": { label: "Self-care", color: "bg-terracotta-light text-terracotta-dark" },
  "connection": { label: "Connection", color: "bg-sage text-forest-dark" },
  "decluttering": { label: "Decluttering", color: "bg-cream-dark text-warm-gray" },
  "giving": { label: "Giving", color: "bg-forest-light text-white" },
  "nature": { label: "Nature", color: "bg-forest text-white" },
  "reflection": { label: "Reflection", color: "bg-terracotta text-white" },
  "cooking": { label: "Cooking", color: "bg-amber-200 text-amber-900" },
  "diy": { label: "DIY", color: "bg-rose-300 text-rose-900" },
};


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isPersian(text: string): boolean {
  const persianRegex = /[\u0600-\u06FF]/;
  return persianRegex.test(text);
}

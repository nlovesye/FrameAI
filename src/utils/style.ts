import { twMerge } from "tailwind-merge";

export function cn(...args: Parameters<typeof twMerge>) {
  return twMerge(...args);
}

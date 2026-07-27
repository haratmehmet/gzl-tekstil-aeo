import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateToLocal(dateInput: any) {
  if (!dateInput) return ""
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return ""
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch {
    return ""
  }
}

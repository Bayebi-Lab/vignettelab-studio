import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Filter out portrait styles, resolution level, and retouching level from package features. */
export function filterPackageFeatures(features: string[]): string[] {
  return features.filter((f) => {
    const lower = f.toLowerCase();
    return (
      !lower.includes("portrait style") &&
      !lower.includes("unlimited styles") &&
      !lower.includes("resolution") &&
      !lower.includes("retouching")
    );
  });
}

import type { SyntheticEvent } from "react";

const baseUrl = import.meta.env.BASE_URL || "/";
const placeholderPath = `${baseUrl}placeholder.svg`;

export const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = placeholderPath;
};

const INVALID_IMAGE_LITERALS = new Set(["", "null", "undefined", "n/a", "na", "-", "none"]);

const normalizeCandidate = (value: string) => value.trim().replace(/\\/g, "/");

export const getSafeImageSrc = (...candidates: Array<string | null | undefined>) => {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = normalizeCandidate(candidate);
    if (!normalized) continue;
    if (INVALID_IMAGE_LITERALS.has(normalized.toLowerCase())) continue;
    if (normalized === "/placeholder.svg") return placeholderPath;
    return normalized;
  }
  return placeholderPath;
};

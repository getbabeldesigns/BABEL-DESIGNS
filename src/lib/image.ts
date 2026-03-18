import type { SyntheticEvent } from "react";

export const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = "/placeholder.svg";
};

const INVALID_IMAGE_LITERALS = new Set(["", "null", "undefined", "n/a", "na", "-", "none"]);

const normalizeCandidate = (value: string) => value.trim().replace(/\\/g, "/");

export const getSafeImageSrc = (...candidates: Array<string | null | undefined>) => {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = normalizeCandidate(candidate);
    if (!normalized) continue;
    if (INVALID_IMAGE_LITERALS.has(normalized.toLowerCase())) continue;
    return normalized;
  }
  return "/placeholder.svg";
};

const DEFAULT_MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? process.env.MEDIA_BASE_URL ?? "http://127.0.0.1:8000";

const sanitizeBase = (base: string) => base.replace(/\/$/, "");
const MEDIA_BASE = sanitizeBase(DEFAULT_MEDIA_BASE_URL);

export const resolveMediaUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${MEDIA_BASE}${path}`;
};

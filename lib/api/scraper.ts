const DEFAULT_SCRAPER_API_BASE = "http://127.0.0.1:8000/api/scraper/";

export const SCRAPER_API_BASE =
  process.env.SCRAPER_API_BASE ?? process.env.NEXT_PUBLIC_SCRAPER_API_BASE ?? DEFAULT_SCRAPER_API_BASE;

export type RunScraperPayload = {
  sites?: string[];
  siteId?: string;
  maxRecords?: number;
  maxItems?: number;
  catalog_urls?: string[];
  catalogUrls?: string[];
};

export type ScraperSiteStat =
  | number
  | {
      totalRecords?: number;
      count?: number;
      lastRun?: string;
      last_run?: string;
      lastCapture?: string;
      last_capture?: string;
      lastCapturedAt?: string;
      last_captured_at?: string;
      [key: string]: unknown;
    };

export type ScraperRecord = {
  id?: string | number;
  site?: string;
  product_name?: string;
  productName?: string;
  title?: string;
  price?: number | string;
  currency?: string;
  url?: string;
  product_url?: string;
  link?: string;
  captured_at?: string;
  capturedAt?: string;
  timestamp?: string;
  lastSeen?: string;
  last_seen?: string;
  availability?: string;
  stock_status?: string;
  [key: string]: unknown;
};

export type ScraperRunResponse = {
  records: ScraperRecord[];
  totalRecords?: number;
  siteStats?: Record<string, ScraperSiteStat>;
  requestedSites?: string[];
  maxRecords?: number;
  returnedRecords?: number;
  runId?: string | number;
  note?: string;
  [key: string]: unknown;
};

async function buildError(res: Response, fallback: string): Promise<never> {
  let detail = fallback;
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") detail = data.detail;
    else if (typeof data === "object" && data) detail = JSON.stringify(data);
  } catch {
    // ignore parse issues
  }
  throw new Error(detail);
}

export async function runScraper(
  payload: RunScraperPayload = {},
  options?: { signal?: AbortSignal },
): Promise<ScraperRunResponse> {
  const endpoint = SCRAPER_API_BASE.endsWith("/") ? `${SCRAPER_API_BASE}run/` : `${SCRAPER_API_BASE}/run/`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: options?.signal,
  });
  if (!res.ok) await buildError(res, "Failed to run scraper");
  return res.json();
}

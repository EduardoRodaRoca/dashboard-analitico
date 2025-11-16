'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { runScraper, SCRAPER_API_BASE, type RunScraperPayload, type ScraperRunResponse } from "@/lib/api/scraper";

const MAX_ALLOWED_RECORDS = 2000;
const DEFAULT_RECORD_LIMIT = 100;
const DEFAULT_SCRAPER_SITES_ENDPOINT = "http://127.0.0.1:8000/api/entities/scraper_sites/";
const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const resolveScraperSitesEndpoint = () => {
  const configuredEndpoint =
    process.env.SCRAPER_SITES_API_BASE ?? process.env.NEXT_PUBLIC_SCRAPER_SITES_API_BASE ?? "";
  if (/^https?:\/\//i.test(configuredEndpoint)) return ensureTrailingSlash(configuredEndpoint);

  const fallbackBase = SCRAPER_API_BASE ?? DEFAULT_SCRAPER_SITES_ENDPOINT;
  try {
    const baseUrl = new URL(fallbackBase);
    if (configuredEndpoint) {
      const resolved = configuredEndpoint.startsWith("/")
        ? new URL(configuredEndpoint, baseUrl.origin)
        : new URL(configuredEndpoint, baseUrl);
      return ensureTrailingSlash(resolved.toString());
    }
    const derived = new URL("../entities/scraper_sites/", baseUrl);
    return ensureTrailingSlash(derived.toString());
  } catch {
    return ensureTrailingSlash(DEFAULT_SCRAPER_SITES_ENDPOINT);
  }
};

const SCRAPER_SITES_ENDPOINT = resolveScraperSitesEndpoint();

type ScraperSite = {
  idSite: string;
  id_site?: string;
  name: string;
  enabled?: boolean;
  catalogUrls?: string[];
  catalog_urls?: string[];
  [key: string]: unknown;
};

type NormalizedRecord = {
  id: string;
  site: string;
  productName: string;
  price?: number;
  currency?: string;
  url?: string;
  capturedAt?: Date;
  availability?: string;
};

type SiteStatCard = {
  site: string;
  count: number;
  lastRun?: Date;
};

type PriceStats = {
  min: NormalizedRecord;
  max: NormalizedRecord;
  avg: number;
};

const formatCurrency = (value?: number, currency = "USD") => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const formatDateTime = (date?: Date) =>
  date
    ? date.toLocaleString("es-BO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/D";

const humanizeSite = (site: string) =>
  site
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Sin sitio";

const clampRecords = (value: number) => Math.min(Math.max(1, Math.round(value)), MAX_ALLOWED_RECORDS);

const normalizeCatalogUrls = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (typeof entry === "number") return String(entry);
      return null;
    })
    .filter((url): url is string => Boolean(url && url.length));
  return normalized.length ? normalized : undefined;
};

export default function CompetitionPage() {
  const [sites, setSites] = useState<ScraperSite[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [maxItems, setMaxItems] = useState(DEFAULT_RECORD_LIMIT);
  const [scraperData, setScraperData] = useState<ScraperRunResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestedAt, setRequestedAt] = useState<Date | null>(null);
  const [requestConfig, setRequestConfig] = useState<
    { siteId: string; maxItems: number; catalogUrls?: string[] } | null
  >(null);

  const loadSites = useCallback(async () => {
    setIsLoadingSites(true);
    setSitesError(null);
    try {
      const response = await fetch(SCRAPER_SITES_ENDPOINT, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("No pudimos cargar las fuentes de scraping");
      }
      const data = await response.json();
      const parsed = (Array.isArray(data) ? data : []) as ScraperSite[];
      const normalized = parsed
        .map((site) => ({
          ...site,
          idSite: site.idSite ?? site.id_site ?? "",
        }))
        .filter((site) => site && site.idSite);
      const enabledSites = normalized.filter((site) => site.enabled !== false);
      setSites(enabledSites);
    } catch (error) {
      setSitesError(error instanceof Error ? error.message : "Error desconocido al cargar las fuentes");
    } finally {
      setIsLoadingSites(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedSite = window.localStorage.getItem("scraper:lastSite");
    if (storedSite) setSelectedSite(storedSite);
    const storedLimit = window.localStorage.getItem("scraper:lastLimit");
    if (storedLimit) {
      const parsedLimit = Number(storedLimit);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        setMaxItems(clampRecords(parsedLimit));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedSite) window.localStorage.setItem("scraper:lastSite", selectedSite);
  }, [selectedSite]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("scraper:lastLimit", String(maxItems));
  }, [maxItems]);

  useEffect(() => {
    if (!sites.length) return;
    if (selectedSite && sites.some((site) => site.idSite === selectedSite)) return;
    const firstSite = sites[0]?.idSite;
    if (firstSite) setSelectedSite(firstSite);
  }, [sites, selectedSite]);

  const triggerScraper = () => {
    if (!selectedSite) {
      setErrorMessage("Selecciona una fuente antes de ejecutar el scraping.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    const selectedSiteConfig = sites.find((site) => site.idSite === selectedSite);
    const catalogUrls = normalizeCatalogUrls(selectedSiteConfig?.catalog_urls ?? selectedSiteConfig?.catalogUrls);
    setRequestConfig({ siteId: selectedSite, maxItems, catalogUrls });
  };

  useEffect(() => {
    if (!requestConfig) return;

    const payload: RunScraperPayload = {
      maxItems: requestConfig.maxItems,
      maxRecords: requestConfig.maxItems,
    };

    if (requestConfig.siteId) {
      payload.siteId = requestConfig.siteId;
    }

    if (requestConfig.catalogUrls?.length) {
      payload.catalog_urls = requestConfig.catalogUrls;
    }

    const controller = new AbortController();

    runScraper(payload, { signal: controller.signal })
      .then((response) => {
        setScraperData(response);
        setRequestedAt(new Date());
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setErrorMessage(error instanceof Error ? error.message : "No pudimos obtener las capturas");
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [requestConfig]);

  const normalizedRecords = useMemo<NormalizedRecord[]>(() => {
    const rows = Array.isArray(scraperData?.records) ? scraperData?.records ?? [] : [];
    return rows
      .map((record, index) => {
        const site = String(record.site ?? record.source ?? "sin_sitio");
        const productName = String(record.product_name ?? record.productName ?? record.title ?? "Producto sin nombre");
        const rawPrice =
          typeof record.price === "string"
            ? Number(record.price.replace(/[^0-9.,-]/g, "").replace(/,/g, "."))
            : record.price;
        const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) ? rawPrice : undefined;
        const currency = record.currency ? String(record.currency) : undefined;
        const capturedSource =
          record.captured_at ?? record.capturedAt ?? record.timestamp ?? record.lastSeen ?? record.last_seen;
        const rawCaptured =
          typeof capturedSource === "string" || typeof capturedSource === "number" ? String(capturedSource) : undefined;
        const capturedAt = rawCaptured ? new Date(rawCaptured) : undefined;
        const url = (record.url ?? record.product_url ?? record.link) as string | undefined;
        const availability = (record.availability ?? record.stock_status) as string | undefined;

        return {
          id: String(record.id ?? record.external_id ?? `${site}-${index}`),
          site,
          productName,
          price,
          currency,
          url,
          capturedAt,
          availability,
        } satisfies NormalizedRecord;
      })
      .sort((a, b) => (b.capturedAt?.getTime() ?? 0) - (a.capturedAt?.getTime() ?? 0));
  }, [scraperData]);

  const siteStats = useMemo<SiteStatCard[]>(() => {
    if (scraperData?.siteStats && typeof scraperData.siteStats === "object") {
      return Object.entries(scraperData.siteStats).map(([site, raw]) => {
        const count =
          typeof raw === "number"
            ? raw
            : typeof raw === "object" && raw
              ? typeof raw.totalRecords === "number"
                ? raw.totalRecords
                : typeof raw.count === "number"
                  ? raw.count
                  : 0
              : 0;
        const lastRaw =
          typeof raw === "object" && raw
            ? (raw.lastRun ??
                raw.last_run ??
                raw.lastCapture ??
                raw.last_capture ??
                raw.lastCapturedAt ??
                raw.last_captured_at)
            : undefined;

        return {
          site,
          count,
          lastRun: lastRaw ? new Date(String(lastRaw)) : undefined,
        } satisfies SiteStatCard;
      });
    }

    const fallback = normalizedRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.site] = (acc[record.site] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(fallback).map(([site, count]) => ({ site, count }));
  }, [scraperData, normalizedRecords]);

  const priceStats = useMemo<PriceStats | null>(() => {
    const priced = normalizedRecords.filter(
      (record): record is NormalizedRecord & { price: number } => typeof record.price === "number",
    );
    if (!priced.length) return null;
    const sorted = [...priced].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    const avg = priced.reduce((sum, record) => sum + (record.price ?? 0), 0) / priced.length;
    return { min: sorted[0], max: sorted[sorted.length - 1], avg } satisfies PriceStats;
  }, [normalizedRecords]);

  const totalRecords = scraperData?.returnedRecords ?? scraperData?.totalRecords ?? normalizedRecords.length;
  const canRequestMore = maxItems < MAX_ALLOWED_RECORDS;
  const selectedSiteStats = selectedSite ? siteStats.find((stat) => stat.site === selectedSite) : undefined;
  const selectedSiteName = selectedSite ? sites.find((site) => site.idSite === selectedSite)?.name : undefined;

  const handleLimitChange = (value: number) => {
    if (Number.isNaN(value)) return;
    const next = clampRecords(value);
    if (next === maxItems) return;
    setMaxItems(next);
  };

  const hasRun = Boolean(scraperData);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Competencia</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Monitoreo de scrapers</h1>
          <span className="pill">{totalRecords} registros</span>
          <button
            type="button"
            onClick={triggerScraper}
            disabled={isLoading || isLoadingSites || !selectedSite}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? "Ejecutando…" : hasRun ? "Volver a ejecutar" : "Iniciar scraping"}
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Disparamos el endpoint de scraping y consolidamos precios, enlaces y disponibilidad en tiempo (casi) real.
        </p>
        {selectedSiteName && (
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fuente seleccionada: {selectedSiteName}</p>
        )}
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fuente</p>
          <div className="flex flex-wrap gap-2">
            <select
              className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
              value={selectedSite ?? ""}
              onChange={(event) => setSelectedSite(event.target.value || null)}
              disabled={isLoadingSites || !sites.length}
            >
              <option value="" disabled>
                {isLoadingSites ? "Cargando fuentes…" : "Selecciona una fuente"}
              </option>
              {sites.map((site) => (
                <option key={site.idSite} value={site.idSite}>
                  {site.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadSites}
              disabled={isLoadingSites}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
            >
              {isLoadingSites ? "Actualizando…" : "Actualizar lista"}
            </button>
          </div>
          {sitesError && <p className="text-xs text-rose-600">{sitesError}</p>}
          {!sitesError && !sites.length && !isLoadingSites && (
            <p className="text-xs text-slate-500">No hay scrapers activos disponibles.</p>
          )}
          {selectedSiteStats && (
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              {`Registros ${selectedSiteStats.count} · Última captura ${
                selectedSiteStats.lastRun ? formatDateTime(selectedSiteStats.lastRun) : "N/D"
              }`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cantidad de items</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={1}
              max={MAX_ALLOWED_RECORDS}
              value={maxItems}
              onChange={(event) => handleLimitChange(Number(event.target.value))}
              className="w-28 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
            />
            <button
              type="button"
              disabled={!canRequestMore || isLoading}
              onClick={() => {
                const next = clampRecords(maxItems + 200);
                if (next === maxItems) return;
                setMaxItems(next);
              }}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
            >
              Solicitar +200
            </button>
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Máximo {MAX_ALLOWED_RECORDS} · actual {maxItems}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Última ejecución</p>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-900">{requestedAt ? formatDateTime(requestedAt) : "Aún no ejecutado"}</p>
            <p className="text-xs text-slate-500">
              {isLoading ? "Actualizando scraper" : hasRun ? "Datos en caché local" : "Ejecuta el scraping para obtener datos"}
            </p>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-semibold">Error al consultar el scraper</p>
          <p className="text-xs">{errorMessage}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
              onClick={triggerScraper}
              disabled={isLoading || !selectedSite}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="space-y-5 rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <header className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capturas</p>
              <p className="text-xl font-semibold text-slate-900">Resultados del scraper</p>
            </div>
            <span className="pill">{normalizedRecords.length} filas</span>
            <button
              type="button"
              onClick={triggerScraper}
              className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
              disabled={isLoading || !selectedSite}
            >
              {isLoading ? "Actualizando…" : hasRun ? "Refrescar" : "Iniciar"}
            </button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th>Producto</th>
                  <th>Sitio</th>
                  <th>Precio</th>
                  <th>Disponibilidad</th>
                  <th>Capturado</th>
                </tr>
              </thead>
              <tbody>
                {normalizedRecords.map((row) => (
                  <tr key={row.id} className="rounded-2xl bg-slate-50/70 text-slate-700">
                    <td className="rounded-l-2xl px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.productName}</p>
                      {row.url ? (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-rose-600"
                        >
                          Ver ficha ↗
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400">Sin enlace</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{humanizeSite(row.site)}</td>
                    <td className="px-4 py-3 font-semibold text-rose-600">
                      {formatCurrency(row.price, row.currency ?? "USD")}
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{row.currency ?? "USD"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-900/5 px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                        {row.availability ?? "N/D"}
                      </span>
                    </td>
                    <td className="rounded-r-2xl px-4 py-3 text-xs text-slate-500">{formatDateTime(row.capturedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!normalizedRecords.length && (
              <p className="py-6 text-center text-sm text-slate-500">
                {isLoading
                  ? "Ejecutando scraper…"
                  : hasRun
                    ? "No hay registros para los filtros actuales."
                    : "Ejecuta el scraping para ver resultados."}
              </p>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
            <header className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sitios</p>
                <p className="text-lg font-semibold text-slate-900">Distribución de capturas</p>
              </div>
              <span className="pill">{siteStats.length}</span>
            </header>
            <div className="mt-4 space-y-3">
              {siteStats.length ? (
                siteStats.map((stat) => (
                  <div key={stat.site} className="rounded-2xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      {humanizeSite(stat.site)}
                      <span className="text-xs text-slate-400">{stat.count} registros</span>
                    </div>
                    {stat.lastRun && (
                      <p className="text-xs text-slate-500">Última captura {formatDateTime(stat.lastRun)}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aún sin estadísticas por sitio.</p>
              )}
            </div>
          </article>

          {priceStats && (
            <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rangos de precios</p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mínimo</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(priceStats.min.price, priceStats.min.currency)}</p>
                  <p className="text-xs text-slate-500">{priceStats.min.productName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Promedio</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(priceStats.avg)}</p>
                  <p className="text-xs text-slate-500">{priceStats.min.currency ?? "USD"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Máximo</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(priceStats.max.price, priceStats.max.currency)}</p>
                  <p className="text-xs text-slate-500">{priceStats.max.productName}</p>
                </div>
              </div>
            </article>
          )}
        </aside>
      </section>
    </section>
  );
}

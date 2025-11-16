import { type Moneda } from "@/lib/data-models";

const DEFAULT_PRECIOS_PROPIOS_API_BASE = "http://127.0.0.1:8000/api/entities/precios_propios/";

export const PRECIOS_PROPIOS_API_BASE =
  process.env.PRECIOS_PROPIOS_API_BASE ??
  process.env.NEXT_PUBLIC_PRECIOS_PROPIOS_API_BASE ??
  DEFAULT_PRECIOS_PROPIOS_API_BASE;

export type PrecioFuente = "lista_base" | "promo" | "custom";

export type PrecioPropioRecord = {
  id_precio?: number;
  idPrecio?: number;
  id_producto?: number;
  idProducto?: number;
  precio: number;
  moneda: Moneda | string;
  fecha_inicio?: string;
  fechaInicio?: string;
  fecha_fin?: string | null;
  fechaFin?: string | null;
  fuente?: PrecioFuente | string;
} & Record<string, unknown>;

export type PrecioPropioCreatePayload = {
  id_precio: number;
  id_producto: number;
  precio: number;
  moneda: Moneda;
  fecha_inicio: string;
  fecha_fin?: string | null;
  fuente?: PrecioFuente;
};

async function buildError(res: Response, fallback: string) {
  let detail = fallback;
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") detail = data.detail;
    else if (typeof data === "object" && data) detail = JSON.stringify(data);
  } catch {
    // ignore parse failures
  }
  throw new Error(detail);
}

export async function createPrecioPropio(payload: PrecioPropioCreatePayload): Promise<PrecioPropioRecord> {
  const res = await fetch(PRECIOS_PROPIOS_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await buildError(res, "Failed to create precio propio");
  return res.json();
}

export async function fetchPreciosPropios(): Promise<PrecioPropioRecord[]> {
  const res = await fetch(PRECIOS_PROPIOS_API_BASE, { cache: "no-store" });
  if (!res.ok) await buildError(res, "Failed to load precios propios");
  const data = await res.json();
  return Array.isArray(data) ? (data as PrecioPropioRecord[]) : [];
}

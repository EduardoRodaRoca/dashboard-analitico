const DEFAULT_PRODUCTOS_API_BASE = "http://127.0.0.1:8000/api/entities/productos/";

export const PRODUCTOS_API_BASE =
  process.env.PRODUCTOS_API_BASE ?? process.env.NEXT_PUBLIC_PRODUCTOS_API_BASE ?? DEFAULT_PRODUCTOS_API_BASE;

export type ProductoRecord = {
  idProducto: number;
  skuInterno: string;
  nombre: string;
  categoria: string;
  marca: string;
  activo: boolean;
  imageUrl?: string | null;
  image_url?: string | null;
} & Record<string, unknown>;

export type ProductoCreatePayload = {
  id_producto: number;
  sku_interno: string;
  nombre: string;
  categoria: string;
  marca: string;
  activo: boolean;
  fecha_creacion: string;
  ancho_cm?: number;
  alto_cm?: number;
  caracteristicas?: string[];
  acabados?: string[];
  image_url?: string;
};

export async function fetchProductos(): Promise<ProductoRecord[]> {
  const res = await fetch(PRODUCTOS_API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load productos");
  return res.json();
}

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

export async function createProducto(producto: ProductoCreatePayload): Promise<ProductoRecord> {
  const res = await fetch(PRODUCTOS_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) await buildError(res, "Failed to create producto");
  return res.json();
}

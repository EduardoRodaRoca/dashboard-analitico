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

export type ProductoPayload = Partial<ProductoRecord> & Record<string, unknown>;

export async function fetchProductos(): Promise<ProductoRecord[]> {
  const res = await fetch(PRODUCTOS_API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load productos");
  return res.json();
}

export async function createProducto(producto: ProductoPayload): Promise<ProductoRecord> {
  const res = await fetch(PRODUCTOS_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Failed to create producto");
  return res.json();
}

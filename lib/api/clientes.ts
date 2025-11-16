const DEFAULT_CLIENTES_API_BASE = "http://127.0.0.1:8000/api/entities/clientes/";

export const CLIENTES_API_BASE =
  process.env.CLIENTES_API_BASE ?? process.env.NEXT_PUBLIC_CLIENTES_API_BASE ?? DEFAULT_CLIENTES_API_BASE;

export type ClienteRecord = {
  idCliente: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  zona: string;
  ciudad: string;
  pais: string;
  canalOrigen: string;
  fechaRegistro: string;
  imageUrl?: string | null;
  image_url?: string | null;
};

export type ClienteCreatePayload = {
  nombre_completo: string;
  email: string;
  telefono: string;
  zona: string;
  ciudad: string;
  pais: string;
  canal_origen: string;
  fecha_registro: string;
  image_url?: string;
};

export type ClienteUpdatePayload = Partial<ClienteCreatePayload>;

export async function fetchClientes(): Promise<ClienteRecord[]> {
  const res = await fetch(CLIENTES_API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load clientes");
  return res.json();
}

async function buildError(res: Response, fallback: string) {
  let detail = fallback;
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") detail = data.detail;
    else if (typeof data === "object" && data) detail = JSON.stringify(data);
  } catch {
    // ignore
  }
  throw new Error(detail);
}

export async function createCliente(cliente: ClienteCreatePayload): Promise<ClienteRecord> {
  const res = await fetch(CLIENTES_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) await buildError(res, "Failed to create cliente");
  return res.json();
}

export async function updateCliente(idCliente: number, cliente: ClienteUpdatePayload): Promise<ClienteRecord> {
  const res = await fetch(`${CLIENTES_API_BASE}${idCliente}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) await buildError(res, "Failed to update cliente");
  return res.json();
}

export async function deleteCliente(idCliente: number): Promise<void> {
  const res = await fetch(`${CLIENTES_API_BASE}${idCliente}/`, { method: "DELETE" });
  if (!res.ok) await buildError(res, "Failed to delete cliente");
}

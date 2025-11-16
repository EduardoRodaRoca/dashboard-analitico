const DEFAULT_PEDIDOS_API_BASE = "http://127.0.0.1:8000/api/entities/pedidos/";

export const PEDIDOS_API_BASE =
  process.env.PEDIDOS_API_BASE ?? process.env.NEXT_PUBLIC_PEDIDOS_API_BASE ?? DEFAULT_PEDIDOS_API_BASE;

export type PedidoRecord = {
  idPedido: number;
  idCliente: number;
  canal: string;
  estado: "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | string;
  montoTotal: number;
  moneda: string;
  fechaCreacion: string;
  fechaConfirmacion?: string | null;
  observaciones?: string | null;
  urlPdfCotizacion?: string | null;
};

export type PedidoPayload = PedidoRecord;

export async function fetchPedidos(): Promise<PedidoRecord[]> {
  const res = await fetch(PEDIDOS_API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load pedidos");
  return res.json();
}

export async function createPedido(pedido: PedidoPayload): Promise<PedidoRecord> {
  const res = await fetch(PEDIDOS_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  if (!res.ok) throw new Error("Failed to create pedido");
  return res.json();
}

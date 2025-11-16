import { fetchPedidos, type PedidoRecord } from "@/lib/api/pedidos";
import { mockClientes, mockPedidoDetalle, mockPedidos } from "@/lib/mock-data";

const statusLabels: Record<string, { label: string; tone: string }> = {
  PENDIENTE: { label: "Pendiente", tone: "bg-amber-100 text-amber-700" },
  CONFIRMADO: { label: "Confirmado", tone: "bg-emerald-100 text-emerald-700" },
  CANCELADO: { label: "Cancelado", tone: "bg-rose-100 text-rose-700" },
};

const statusOrder: Array<keyof typeof statusLabels> = ["PENDIENTE", "CONFIRMADO", "CANCELADO"];

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(value);

type PedidoLite = {
  idPedido: number;
  idCliente: number;
  canal: string;
  estado: string;
  montoTotal: number;
  moneda: string;
  fechaCreacion: Date;
  fechaConfirmacion?: Date;
  observaciones?: string;
  urlPdfCotizacion?: string;
};

const normalizePedidoRecord = (record: PedidoRecord): PedidoLite => ({
  idPedido: record.idPedido,
  idCliente: record.idCliente,
  canal: record.canal,
  estado: record.estado,
  montoTotal: record.montoTotal,
  moneda: record.moneda,
  fechaCreacion: new Date(record.fechaCreacion),
  fechaConfirmacion: record.fechaConfirmacion ? new Date(record.fechaConfirmacion) : undefined,
  observaciones: record.observaciones ?? undefined,
  urlPdfCotizacion: record.urlPdfCotizacion ?? undefined,
});

const mapMockPedido = (pedido: (typeof mockPedidos)[number]): PedidoLite => ({
  idPedido: pedido.idPedido,
  idCliente: pedido.idCliente,
  canal: pedido.canal,
  estado: pedido.estado,
  montoTotal: pedido.montoTotal,
  moneda: pedido.moneda,
  fechaCreacion: pedido.fechaCreacion,
  fechaConfirmacion: pedido.fechaConfirmacion,
  observaciones: pedido.observaciones,
  urlPdfCotizacion: pedido.urlPdfCotizacion,
});

export default async function OrdersPage() {
  let pedidos: PedidoLite[] = [];
  let fetchError: string | null = null;
  let usingFallback = false;

  try {
    const response = await fetchPedidos();
    pedidos = response.map(normalizePedidoRecord);
    if (!pedidos.length) throw new Error("Respuesta vacía de pedidos");
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Error desconocido";
    pedidos = mockPedidos.map(mapMockPedido);
    usingFallback = true;
  }

  const confirmados = pedidos.filter((pedido) => pedido.estado === "CONFIRMADO");
  const activos = pedidos.filter((pedido) => pedido.estado !== "CANCELADO");
  const totalMontoConfirmado = confirmados.reduce((acc, pedido) => acc + pedido.montoTotal, 0);
  const ticketPromedio = confirmados.length ? totalMontoConfirmado / confirmados.length : 0;
  const tasaConfirmacion = activos.length ? (confirmados.length / activos.length) * 100 : 0;
  const promedioItems = confirmados.length
    ? confirmados.reduce(
        (acc, pedido) => acc + mockPedidoDetalle.filter((d) => d.idPedido === pedido.idPedido).length,
        0,
      ) / confirmados.length
    : 0;
  const groupedPedidos = statusOrder.map((status) => ({
    status,
    pedidos: pedidos.filter((pedido) => pedido.estado === status),
  }));

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pedidos</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Pipeline operativo</h1>
          <button
            type="button"
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Agregar pedido
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Seguimiento centralizado de cotizaciones, confirmaciones y entregas en curso.
        </p>
        {fetchError && (
          <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-2 text-sm text-rose-700">
            No pudimos cargar pedidos desde la API ({fetchError}). {usingFallback ? "Mostramos datos locales como referencia." : "Intenta nuevamente."}
          </p>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ticket promedio</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {formatCurrency(ticketPromedio, confirmados[0]?.moneda ?? "USD")}
          </p>
          <p className="text-xs text-slate-500">Solo pedidos confirmados</p>
        </article>
        <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tasa de confirmación</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{tasaConfirmacion.toFixed(1)}%</p>
          <p className="text-xs text-slate-500">
            {confirmados.length}/{activos.length} pedidos activos
          </p>
        </article>
        <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pedidos abiertos</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {pedidos.filter((pedido) => pedido.estado === "PENDIENTE").length}
          </p>
          <p className="text-xs text-slate-500">Incluye todos los canales</p>
        </article>
        <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Items por pedido</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{promedioItems.toFixed(1)}</p>
          <p className="text-xs text-slate-500">Promedio en confirmados</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {groupedPedidos.map(({ status, pedidos }) => (
          <article key={status} className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{statusLabels[status].label}</p>
                <p className="text-xl font-semibold text-slate-900">{pedidos.length} pedidos</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusLabels[status].tone}`}>
                {statusLabels[status].label}
              </span>
            </header>
            <div className="mt-5 space-y-4">
              {pedidos.length === 0 && (
                <p className="text-sm text-slate-500">No hay registros para este estado.</p>
              )}
              {pedidos.map((pedido) => {
                const cliente = mockClientes.find((c) => c.idCliente === pedido.idCliente);
                const detalles = mockPedidoDetalle.filter((detalle) => detalle.idPedido === pedido.idPedido);
                return (
                  <div key={pedido.idPedido} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Pedido #{pedido.idPedido}</p>
                        <p className="text-xs text-slate-500">
                          {cliente?.nombreCompleto} · {pedido.canal.toUpperCase()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(pedido.montoTotal, pedido.moneda)}
                      </p>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                      <p>
                        Creado el {pedido.fechaCreacion.toLocaleDateString("es-BO")}
                        {pedido.fechaConfirmacion && ` · Confirmado ${pedido.fechaConfirmacion.toLocaleDateString("es-BO")}`}
                      </p>
                      <p>{detalles.length} líneas · {detalles.reduce((acc, d) => acc + d.cantidad, 0)} unidades</p>
                      <p>Observaciones: {pedido.observaciones || "—"}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <a
                        href={pedido.urlPdfCotizacion}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-rose-200 hover:text-rose-600"
                      >
                        Ver cotización
                      </a>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-rose-200 hover:text-rose-600"
                      >
                        Actualizar estado
                      </button>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {detalles.slice(0, 3).map((detalle) => (
                        <li key={detalle.idDetalle} className="text-xs text-slate-500">
                          • {detalle.cantidad} x {detalle.precioUnitario.toFixed(0)} ({detalle.descuentoPorcentaje}% off)
                        </li>
                      ))}
                      {detalles.length > 3 && (
                        <li className="text-xs text-rose-600">+{detalles.length - 3} líneas adicionales</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

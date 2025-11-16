import { fetchClientes, type ClienteRecord } from "@/lib/api/clientes";
import { fetchProductos, type ProductoRecord } from "@/lib/api/productos";
import { fetchPedidos, type PedidoRecord } from "@/lib/api/pedidos";
import { mockClientes, mockPedidos, mockProductos } from "@/lib/mock-data";

type ClienteLike = ClienteRecord | (typeof mockClientes)[number];
type ProductoLike = ProductoRecord | (typeof mockProductos)[number];
type PedidoLike = PedidoRecord | (typeof mockPedidos)[number];

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatUsd = (value: number) => currencyFormatter.format(value);
const monthFormatter = new Intl.DateTimeFormat("es-BO", { month: "short", year: "numeric" });

const extractZoneLabel = (cliente: ClienteLike): string => {
  const source = cliente as Record<string, unknown>;
  const zoneCandidate = source.zona ?? source.region ?? source.area;
  if (typeof zoneCandidate === "string" && zoneCandidate.trim()) return zoneCandidate.trim();
  const cityCandidate = source.ciudad;
  if (typeof cityCandidate === "string" && cityCandidate.trim()) return cityCandidate.trim();
  return "Sin zona";
};

const extractChannelLabel = (cliente: ClienteLike): string => {
  const source = cliente as Record<string, unknown>;
  const channelCandidate = source.canalOrigen ?? source.canal_origen ?? source.canal ?? source.channel;
  if (typeof channelCandidate === "string" && channelCandidate.trim()) return channelCandidate.trim();
  return "Sin canal";
};

const extractCategoryLabel = (producto: ProductoLike): string => {
  const source = producto as Record<string, unknown>;
  const categoryCandidate = source.categoria ?? source.category ?? source.segmento;
  if (typeof categoryCandidate === "string" && categoryCandidate.trim()) return categoryCandidate.trim();
  return "Sin categoría";
};

const extractBrandLabel = (producto: ProductoLike): string => {
  const source = producto as Record<string, unknown>;
  const brandCandidate = source.marca ?? source.brand ?? source.marcaComercial;
  if (typeof brandCandidate === "string" && brandCandidate.trim()) return brandCandidate.trim();
  return "Sin marca";
};

const isProductoActivo = (producto: ProductoLike): boolean => {
  const source = producto as Record<string, unknown>;
  if (typeof source.activo === "boolean") return source.activo;
  if (typeof source.active === "boolean") return source.active;
  if (typeof source.estado === "string") return source.estado.toLowerCase() === "activo";
  return true;
};

const buildHistogram = (labels: string[]) => {
  const counts = labels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
};

const buildZoneHistogram = (clientes: ClienteLike[]) => buildHistogram(clientes.map(extractZoneLabel));

const buildChannelMix = (clientes: ClienteLike[]) => buildHistogram(clientes.map(extractChannelLabel));

const buildCategoryShare = (productos: ProductoLike[]) => buildHistogram(productos.map(extractCategoryLabel));

const buildBrandShare = (productos: ProductoLike[]) => buildHistogram(productos.map(extractBrandLabel));

const summarizeProductStatus = (productos: ProductoLike[]) => {
  return productos.reduce(
    (acc, producto) => {
      if (isProductoActivo(producto)) acc.activos += 1;
      else acc.inactivos += 1;
      return acc;
    },
    { activos: 0, inactivos: 0 }
  );
};

const aggregateOrdersByState = (pedidos: PedidoLike[]) => {
  const totals = pedidos.reduce<Record<string, { state: string; total: number; count: number }>>((acc, pedido) => {
    const source = pedido as Record<string, unknown>;
    const stateCandidate = source.estado;
    const normalized = typeof stateCandidate === "string" && stateCandidate.trim()
      ? stateCandidate.trim().toUpperCase()
      : "SIN ESTADO";
    const amountCandidate = source.montoTotal;
    const amount = typeof amountCandidate === "number" ? amountCandidate : 0;
    acc[normalized] = acc[normalized] ?? { state: normalized, total: 0, count: 0 };
    acc[normalized].total += amount;
    acc[normalized].count += 1;
    return acc;
  }, {});

  return Object.values(totals).sort((a, b) => b.total - a.total);
};

const extractOrderChannel = (pedido: PedidoLike): string => {
  const source = pedido as Record<string, unknown>;
  const channelCandidate = source.canal ?? source.channel ?? source.canalOrigen ?? source.via;
  if (typeof channelCandidate === "string" && channelCandidate.trim()) return channelCandidate.trim();
  return "Sin canal";
};

const aggregateOrdersByChannel = (pedidos: PedidoLike[]) => {
  const totals = pedidos.reduce<Record<string, { channel: string; amount: number; count: number }>>((acc, pedido) => {
    const channel = extractOrderChannel(pedido);
    const amountCandidate = (pedido as Record<string, unknown>).montoTotal;
    const amount = typeof amountCandidate === "number" ? amountCandidate : 0;
    acc[channel] = acc[channel] ?? { channel, amount: 0, count: 0 };
    acc[channel].amount += amount;
    acc[channel].count += 1;
    return acc;
  }, {});
  return Object.values(totals).sort((a, b) => b.amount - a.amount);
};

const parseDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

const computeOrderStats = (pedidos: PedidoLike[]) => {
  const totalPedidos = pedidos.length;
  let confirmed = 0;
  let confirmedAmount = 0;
  const cycleDays: number[] = [];

  pedidos.forEach((pedido) => {
    const source = pedido as Record<string, unknown>;
    const normalizedState = typeof source.estado === "string" ? source.estado.trim().toUpperCase() : "";
    const amount = typeof source.montoTotal === "number" ? source.montoTotal : 0;
    if (normalizedState === "CONFIRMADO") {
      confirmed += 1;
      confirmedAmount += amount;
      const created = parseDate(source.fechaCreacion);
      const confirmedDate = parseDate(source.fechaConfirmacion ?? source.fecha_confirmacion);
      if (created && confirmedDate) {
        const diffDays = Math.max(1, Math.round((confirmedDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        cycleDays.push(diffDays);
      }
    }
  });

  const conversionPct = totalPedidos ? (confirmed / totalPedidos) * 100 : 0;
  const avgTicket = confirmed ? confirmedAmount / confirmed : 0;
  const avgCycleDays = cycleDays.length ? cycleDays.reduce((sum, days) => sum + days, 0) / cycleDays.length : 0;

  return { conversionPct, avgTicket, avgCycleDays, confirmedCount: confirmed, totalCount: totalPedidos };
};

const buildMonthlyClientRegistrations = (clientes: ClienteLike[], limit = 6) => {
  const buckets = clientes.reduce<Record<string, { label: string; total: number; sortKey: number }>>((acc, cliente) => {
    const source = cliente as Record<string, unknown>;
    const rawDate = source.fechaRegistro ?? source.fecha_registro ?? source.createdAt ?? source.created_at;
    const parsed = parseDate(rawDate);
    if (!parsed) return acc;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const label = monthFormatter.format(parsed).replace(".", "");
    const sortKey = parsed.getFullYear() * 12 + parsed.getMonth();
    acc[key] = acc[key] ?? { label, total: 0, sortKey };
    acc[key].total += 1;
    return acc;
  }, {});
  return Object.values(buckets)
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, limit);
};

export default async function AnalyticsPage() {
  let clientes: ClienteLike[] = [];
  let productos: ProductoLike[] = [];
  let pedidos: PedidoLike[] = [];

  let clientesError: string | null = null;
  let productosError: string | null = null;
  let pedidosError: string | null = null;

  let usingClientesFallback = false;
  let usingProductosFallback = false;
  let usingPedidosFallback = false;

  const [clientesResult, productosResult, pedidosResult] = await Promise.allSettled([
    fetchClientes(),
    fetchProductos(),
    fetchPedidos(),
  ]);

  if (clientesResult.status === "fulfilled") {
    clientes = clientesResult.value;
  } else {
    clientesError = clientesResult.reason instanceof Error ? clientesResult.reason.message : "Error desconocido";
    clientes = mockClientes;
    usingClientesFallback = true;
  }

  if (productosResult.status === "fulfilled") {
    productos = productosResult.value;
  } else {
    productosError = productosResult.reason instanceof Error ? productosResult.reason.message : "Error desconocido";
    productos = mockProductos;
    usingProductosFallback = true;
  }

  if (pedidosResult.status === "fulfilled") {
    pedidos = pedidosResult.value;
  } else {
    pedidosError = pedidosResult.reason instanceof Error ? pedidosResult.reason.message : "Error desconocido";
    pedidos = mockPedidos;
    usingPedidosFallback = true;
  }

  const zoneHistogram = buildZoneHistogram(clientes);
  const topZoneHistogram = zoneHistogram.slice(0, 6);
  const maxZoneCount = topZoneHistogram[0]?.total ?? 1;

  const channelMix = buildChannelMix(clientes);
  const topChannelMix = channelMix.slice(0, 5);
  const maxChannelCount = topChannelMix[0]?.total ?? 1;

  const categoryShare = buildCategoryShare(productos);
  const topCategoryShare = categoryShare.slice(0, 4);
  const maxCategoryCount = topCategoryShare[0]?.total ?? 1;
  const brandShare = buildBrandShare(productos);
  const topBrandShare = brandShare.slice(0, 5);
  const maxBrandCount = topBrandShare[0]?.total ?? 1;
  const productStatus = summarizeProductStatus(productos);
  const totalProductos = productStatus.activos + productStatus.inactivos;

  const orderStates = aggregateOrdersByState(pedidos);
  const maxOrderTotal = orderStates[0]?.total ?? 1;
  const ordersByChannel = aggregateOrdersByChannel(pedidos);
  const topOrdersByChannel = ordersByChannel.slice(0, 5);
  const maxOrderChannelAmount = topOrdersByChannel[0]?.amount ?? 1;
  const orderStats = computeOrderStats(pedidos);

  const recentRegistrations = buildMonthlyClientRegistrations(clientes);
  const maxRegistrations = recentRegistrations[0]?.total ?? 1;

  return (
    <section className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Productos</p>
              <p className="text-xl font-semibold text-slate-900">Estado del catálogo</p>
            </div>
            <span className="pill">{totalProductos} en total</span>
          </header>
          {productosError && (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-2 text-sm text-amber-700">
              No pudimos actualizar la data de productos ({productosError}). {usingProductosFallback ? "Mostramos referencias locales." : "Intenta nuevamente."}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Activos</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{productStatus.activos}</p>
              <p className="text-xs text-emerald-700/80">{totalProductos ? Math.round((productStatus.activos / totalProductos) * 100) : 0}% del catálogo</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pausados</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800">{productStatus.inactivos}</p>
              <p className="text-xs text-slate-500">Incluye ediciones fuera de temporada</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mix por categoría</p>
            {topCategoryShare.length ? (
              <div className="mt-3 space-y-3">
                {topCategoryShare.map(({ label, total }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{label}</span>
                      <span>{total} SKUs</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                        style={{ width: `${Math.min(100, Math.max(12, (total / maxCategoryCount) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Aún no hay productos disponibles para agrupar.</p>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pedidos</p>
              <p className="text-xl font-semibold text-slate-900">Embudo comercial</p>
            </div>
            <span className="pill">{orderStats.totalCount} registros</span>
          </header>
          {pedidosError && (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-2 text-sm text-amber-700">
              No pudimos actualizar los pedidos ({pedidosError}). {usingPedidosFallback ? "Usamos datos mock para visualizar." : "Intenta nuevamente."}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Conversión</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{orderStats.conversionPct.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">{orderStats.confirmedCount} confirmados</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ticket medio</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatUsd(orderStats.avgTicket || 0)}</p>
              <p className="text-xs text-slate-500">Sólo pedidos cerrados</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ciclo</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{orderStats.avgCycleDays.toFixed(1)} días</p>
              <p className="text-xs text-slate-500">Creación a confirmación</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {orderStates.length ? (
              orderStates.map(({ state, total, count }) => (
                <div key={state} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{state}</span>
                    <span>{formatUsd(total)} · {count} pedidos</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                      style={{ width: `${Math.min(100, Math.max(12, (total / maxOrderTotal) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aún no hay pedidos registrados.</p>
            )}
          </div>
        </article>
      </section>

      {clientesError && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
          No pudimos actualizar la data de clientes ({clientesError}). {usingClientesFallback ? "Mostramos referencias locales." : "Intenta nuevamente."}
        </p>
      )}

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Productos</p>
              <p className="text-xl font-semibold text-slate-900">Mix por marca</p>
            </div>
            <span className="pill">Top {topBrandShare.length || 0}</span>
          </header>
          {topBrandShare.length ? (
            <div className="space-y-3">
              {topBrandShare.map(({ label, total }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{label}</span>
                    <span>{total} SKUs</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                      style={{ width: `${Math.min(100, Math.max(12, (total / maxBrandCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hay datos suficientes para agrupar por marca.</p>
          )}
        </article>

        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pedidos</p>
              <p className="text-xl font-semibold text-slate-900">Canales comerciales</p>
            </div>
            <span className="pill">Top {topOrdersByChannel.length || 0}</span>
          </header>
          {topOrdersByChannel.length ? (
            <div className="space-y-3">
              {topOrdersByChannel.map(({ channel, amount, count }) => (
                <div key={channel} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{channel}</span>
                    <span>{formatUsd(amount)} · {count} pedidos</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                      style={{ width: `${Math.min(100, Math.max(12, (amount / maxOrderChannelAmount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aún no hay pedidos clasificados por canal.</p>
          )}
        </article>

        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clientes</p>
              <p className="text-xl font-semibold text-slate-900">Ingresos recientes</p>
            </div>
            <span className="pill">Últimos {recentRegistrations.length || 0} meses</span>
          </header>
          {recentRegistrations.length ? (
            <div className="space-y-3">
              {recentRegistrations.map(({ label, total }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{label}</span>
                    <span>{total} clientes</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                      style={{ width: `${Math.min(100, Math.max(12, (total / maxRegistrations) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Registra clientes para ver la tendencia mensual.</p>
          )}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clientes</p>
              <p className="text-xl font-semibold text-slate-900">Canales principales</p>
            </div>
            <span className="pill">Top {topChannelMix.length || 0}</span>
          </header>
          {topChannelMix.length ? (
            <div className="space-y-3">
              {topChannelMix.map(({ label, total }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{label}</span>
                    <span>{total} ingresos</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                      style={{ width: `${Math.min(100, Math.max(12, (total / maxChannelCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hay clientes por canal para mostrar.</p>
          )}
        </article>

        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clientes</p>
              <p className="text-xl font-semibold text-slate-900">Concentración por zona</p>
            </div>
            <span className="pill">Top {topZoneHistogram.length || 0}</span>
          </header>
          {topZoneHistogram.length ? (
            <div className="space-y-4">
              {topZoneHistogram.map(({ label, total }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{label}</span>
                    <span>{total} clientes</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                      style={{ width: `${Math.min(100, Math.max(12, (total / maxZoneCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aún no hay clientes registrados para analizar zonas.</p>
          )}
        </article>
      </section>
    </section>
  );
}

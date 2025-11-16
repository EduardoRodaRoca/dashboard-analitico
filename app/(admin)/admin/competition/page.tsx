'use client';

import { useMemo, useState } from "react";
import {
  mockCompetidores,
  mockPreciosCompetencia,
  mockPreciosPropios,
  mockProductos,
} from "@/lib/mock-data";

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "USD",
});

const dateDiffInDays = (date: Date) => {
  const diff = Date.now() - date.getTime();
  return diff / 86400000;
};

const getLatestPropioPrice = (productId: number) => {
  const entries = mockPreciosPropios
    .filter((precio) => precio.idProducto === productId)
    .sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime());
  return entries[0];
};

const getCompetitorStats = (productId: number) => {
  const competitorEntries = mockPreciosCompetencia.filter((item) => item.idProducto === productId);
  if (!competitorEntries.length) {
    return {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      avg: undefined as number | undefined,
    };
  }
  const prices = competitorEntries.map((entry) => entry.precio);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((acc, price) => acc + price, 0) / prices.length;
  return { min, max, avg };
};

const chartPointsForProduct = (productId: number) => {
  const propios = mockPreciosPropios
    .filter((precio) => precio.idProducto === productId)
    .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime());
  const stats = getCompetitorStats(productId);
  return propios.map((precio) => ({
    label: precio.fechaInicio.toLocaleDateString("es-BO", { month: "short", day: "2-digit" }),
    own: precio.precio,
    marketMin: stats.min ?? precio.precio * 0.95,
    marketAvg: stats.avg ?? precio.precio * 0.97,
  }));
};

const alertCards = (productId: number) => {
  const latest = getLatestPropioPrice(productId);
  const stats = getCompetitorStats(productId);
  if (!latest || !stats.min || !stats.avg) {
    return [
      {
        tone: "bg-slate-100 text-slate-600",
        title: "Sin datos comparativos",
        detail: "Necesitamos más capturas para calcular desvíos.",
      },
    ];
  }

  const alerts = [] as Array<{ tone: string; title: string; detail: string }>;
  if (latest.precio > stats.avg * 1.08) {
    alerts.push({
      tone: "bg-rose-100 text-rose-700",
      title: "Precio sobre mercado",
      detail: `Tu última lista (${currencyFormatter.format(latest.precio)}) supera el promedio (${currencyFormatter.format(
        stats.avg,
      )}).`,
    });
  }
  if (latest.precio < stats.min * 0.92) {
    alerts.push({
      tone: "bg-amber-100 text-amber-800",
      title: "Precio por debajo",
      detail: `La referencia mínima es ${currencyFormatter.format(stats.min)}. Ajusta márgenes o comunica diferenciales.`,
    });
  }
  if (!alerts.length) {
    alerts.push({
      tone: "bg-emerald-100 text-emerald-700",
      title: "Dentro del rango",
      detail: "El precio propio se mantiene competitivo frente al mercado.",
    });
  }
  return alerts;
};

const productOptions = mockProductos.map((producto) => ({
  label: `${producto.nombre} (${producto.skuInterno})`,
  value: producto.idProducto,
}));

const competitorOptions = mockCompetidores.map((competidor) => ({
  label: competidor.nombre,
  value: competidor.idCompetidor,
}));

const dateOptions = [
  { label: "7 días", value: "7d" },
  { label: "30 días", value: "30d" },
  { label: "Todo", value: "all" },
] as const;

export default function CompetitionPage() {
  const [selectedProduct, setSelectedProduct] = useState(productOptions[0]?.value ?? 0);
  const [selectedCompetitor, setSelectedCompetitor] = useState<number | "all">("all");
  const [selectedDate, setSelectedDate] = useState<(typeof dateOptions)[number]["value"]>("30d");
  const [activeTab, setActiveTab] = useState<"precios" | "competidores">("precios");

  const filteredRows = useMemo(() => {
    const dateLimit = selectedDate === "all" ? Infinity : selectedDate === "7d" ? 7 : 30;
    return mockPreciosCompetencia
      .filter((row) => (selectedProduct ? row.idProducto === selectedProduct : true))
      .filter((row) => (selectedCompetitor === "all" ? true : row.idCompetidor === selectedCompetitor))
      .filter((row) => (selectedDate === "all" ? true : dateDiffInDays(row.timestamp) <= dateLimit))
      .map((row) => {
        const producto = mockProductos.find((p) => p.idProducto === row.idProducto);
        const competidor = mockCompetidores.find((c) => c.idCompetidor === row.idCompetidor);
        const propio = getLatestPropioPrice(row.idProducto);
        return {
          ...row,
          productoNombre: producto?.nombre ?? "",
          skuInterno: producto?.skuInterno ?? "",
          competidorNombre: competidor?.nombre ?? "",
          propioPrecio: propio?.precio,
          propioFuente: propio?.fuente,
        };
      });
  }, [selectedProduct, selectedCompetitor, selectedDate]);

  const chartPoints = useMemo(() => chartPointsForProduct(selectedProduct), [selectedProduct]);
  const alerts = useMemo(() => alertCards(selectedProduct), [selectedProduct]);
  const productMeta = mockProductos.find((p) => p.idProducto === selectedProduct);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Competencia</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Comparativo de precios</h1>
          <span className="pill">Dataset beta</span>
        </div>
        <p className="text-sm text-slate-500">
          Monitoreamos precios externos para alinear estrategia comercial y anticipar movimientos de mercado.
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm lg:grid-cols-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Producto</p>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            value={selectedProduct}
            onChange={(event) => setSelectedProduct(Number(event.target.value))}
          >
            {productOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Competidor</p>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            value={selectedCompetitor}
            onChange={(event) =>
              setSelectedCompetitor(event.target.value === "all" ? "all" : Number(event.target.value))
            }
          >
            <option value="all">Todos</option>
            {competitorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fecha</p>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value as (typeof dateOptions)[number]["value"])}
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Resumen</p>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-900">{filteredRows.length} capturas</p>
            <p className="text-xs text-slate-500">
              {selectedDate === "all" ? "Histórico" : `Últimos ${selectedDate === "7d" ? "7 días" : "30 días"}`}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="space-y-5 rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <header className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Comparativo</p>
              <p className="text-xl font-semibold text-slate-900">Tabla de capturas</p>
            </div>
            <span className="pill">{filteredRows.length} filas</span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th>Producto</th>
                  <th>Competidor</th>
                  <th>Precio externo</th>
                  <th>Precio propio</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.idPrecioComp} className="rounded-2xl bg-slate-50/70 text-slate-700">
                    <td className="rounded-l-2xl px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.productoNombre}</p>
                      <p className="text-xs text-slate-500">SKU {row.skuInterno}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.competidorNombre}</p>
                      <a
                        href={row.urlProducto}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-rose-600"
                      >
                        Ver ficha ↗
                      </a>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-600">
                      {currencyFormatter.format(row.precio)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {row.propioPrecio ? currencyFormatter.format(row.propioPrecio) : "—"}
                      </p>
                      <p className="text-xs text-slate-500">{row.propioFuente ?? "sin fuente"}</p>
                    </td>
                    <td className="rounded-r-2xl px-4 py-3 text-xs text-slate-500">
                      {row.timestamp.toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredRows.length && (
              <p className="py-6 text-center text-sm text-slate-500">No hay capturas con los filtros seleccionados.</p>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          {alerts.map((alert) => (
            <article key={alert.title} className={`rounded-3xl px-4 py-3 text-sm font-medium ${alert.tone}`}>
              <p className="text-xs uppercase tracking-[0.3em]">Alerta</p>
              <p className="text-base">{alert.title}</p>
              <p className="text-xs opacity-80">{alert.detail}</p>
            </article>
          ))}

          <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Producto seleccionado</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{productMeta?.nombre}</p>
            <p className="text-xs text-slate-500">{productMeta?.caracteristicas?.slice(0, 2).join(" • ") ?? "Sin detalle"}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">Acabados</p>
            <p className="text-sm text-slate-600">{productMeta?.acabados?.join(", ") ?? "N/D"}</p>
          </article>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm lg:col-span-2">
          <header className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Evolución</p>
              <p className="text-xl font-semibold text-slate-900">Precio propio vs mercado</p>
            </div>
            <span className="pill">{chartPoints.length} puntos</span>
          </header>
          <div className="mt-6 h-64 rounded-2xl bg-slate-50 p-4">
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
              {(() => {
                if (!chartPoints.length) return null;
                const maxValue = Math.max(...chartPoints.map((point) => Math.max(point.own, point.marketAvg)));
                const minValue = Math.min(...chartPoints.map((point) => Math.min(point.own, point.marketMin)));
                const scaleY = (value: number) =>
                  180 - ((value - minValue) / (maxValue - minValue || 1)) * 160;
                const scaleX = (index: number) => (index / (chartPoints.length - 1 || 1)) * 380 + 10;

                const ownPath = chartPoints
                  .map((point, index) => `${index === 0 ? 'M' : 'L'}${scaleX(index)},${scaleY(point.own)}`)
                  .join(' ');
                const minPath = chartPoints
                  .map((point, index) => `${index === 0 ? 'M' : 'L'}${scaleX(index)},${scaleY(point.marketMin)}`)
                  .join(' ');
                const avgPath = chartPoints
                  .map((point, index) => `${index === 0 ? 'M' : 'L'}${scaleX(index)},${scaleY(point.marketAvg)}`)
                  .join(' ');

                return (
                  <>
                    <path d={minPath} fill="none" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
                    <path d={avgPath} fill="none" stroke="#fb7185" strokeWidth={2} strokeDasharray="6 4" />
                    <path d={ownPath} fill="none" stroke="#0f172a" strokeWidth={3} />
                  </>
                );
              })()}
            </svg>
            <div className="mt-4 grid grid-cols-3 text-xs text-slate-500">
              {chartPoints.map((point) => (
                <div key={point.label}>
                  <p className="font-semibold text-slate-900">{point.label}</p>
                  <p>Propio {currencyFormatter.format(point.own)}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab("precios")}
              className={`flex-1 rounded-2xl px-3 py-2 ${activeTab === "precios" ? "bg-white text-slate-900" : ""}`}
            >
              Alertas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("competidores")}
              className={`flex-1 rounded-2xl px-3 py-2 ${activeTab === "competidores" ? "bg-white text-slate-900" : ""}`}
            >
              Competidores
            </button>
          </div>
          {activeTab === "precios" ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-xs text-slate-500">{alert.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {mockCompetidores.map((competidor) => (
                <div key={competidor.idCompetidor} className="rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{competidor.nombre}</p>
                      <a href={competidor.urlBase} className="text-xs text-rose-600" target="_blank" rel="noreferrer">
                        {competidor.urlBase}
                      </a>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        competidor.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {competidor.activo ? "Activo" : "En pausa"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Método</p>
                  <p className="text-sm font-semibold text-slate-900">{competidor.metodoExtraccion}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

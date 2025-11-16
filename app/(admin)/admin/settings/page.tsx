'use client';

import { useMemo, useState } from "react";
import {
  mockClientes,
  mockCompetidores,
  mockDimZona,
  mockLeadInsights,
  mockPreciosCompetencia,
  mockPreciosPropios,
  mockProductos,
} from "@/lib/mock-data";

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "USD",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ChannelKey = "email" | "slack" | "sms";

const roleDefinitions = [
  {
    name: "Administración",
    description: "Control total sobre precios, catálogo e integraciones.",
    members: 4,
    scope: "Pricing Squad",
    critical: true,
  },
  {
    name: "Operaciones",
    description: "Gestiona pedidos, logística y SLAs regionales.",
    members: 9,
    scope: "Ops LATAM",
    critical: false,
  },
  {
    name: "Partners / OEM",
    description: "Acceso limitado a costos y configuradores.",
    members: 12,
    scope: "Alianzas",
    critical: false,
  },
];

const integrationCatalog = {
  erp: [
    {
      name: "Totvs Protheus",
      scope: "ERP",
      status: "Sincronizado",
      lastSync: "2024-10-12T09:15:00Z",
      owner: "Finanzas",
    },
    {
      name: "SAP Ariba",
      scope: "Compras",
      status: "Errores menores",
      lastSync: "2024-10-14T13:45:00Z",
      owner: "Procurement",
    },
  ],
  bi: [
    {
      name: "Power BI Workspace",
      scope: "Revenue",
      status: "Operativo",
      lastSync: "2024-10-15T06:30:00Z",
      owner: "Data Office",
    },
    {
      name: "Looker Blocks",
      scope: "Marketing",
      status: "En revisión",
      lastSync: "2024-10-11T22:10:00Z",
      owner: "Growth",
    },
  ],
};

const adminLogs = [
  {
    id: 1,
    actor: "M. Roca",
    action: "Actualizó umbral de alerta competitiva",
    scope: "Pricing",
    timestamp: new Date("2024-10-15T08:22:00Z"),
  },
  {
    id: 2,
    actor: "L. Villarroel",
    action: "Sincronizó credenciales ERP",
    scope: "Integraciones",
    timestamp: new Date("2024-10-14T18:04:00Z"),
  },
  {
    id: 3,
    actor: "Sistema",
    action: "Generó log para acción masiva en DimZona",
    scope: "Data Governance",
    timestamp: new Date("2024-10-14T05:51:00Z"),
  },
];

export default function SettingsPage() {
  const [alertThreshold, setAlertThreshold] = useState(15);
  const [autoPause, setAutoPause] = useState(true);
  const [channelState, setChannelState] = useState<Record<ChannelKey, boolean>>({
    email: true,
    slack: true,
    sms: false,
  });

  const latestOwnPriceByProduct = useMemo(() => {
    return mockProductos.reduce<Record<number, number | undefined>>((acc, producto) => {
      const priceEntries = mockPreciosPropios
        .filter((entry) => entry.idProducto === producto.idProducto)
        .sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime());
      acc[producto.idProducto] = priceEntries[0]?.precio;
      return acc;
    }, {});
  }, []);

  const alertRows = useMemo(() => {
    return mockPreciosCompetencia
      .map((entry) => {
        const product = mockProductos.find((item) => item.idProducto === entry.idProducto);
        const competitor = mockCompetidores.find((item) => item.idCompetidor === entry.idCompetidor);
        const ownPrice = latestOwnPriceByProduct[entry.idProducto];
        const diffPercent = ownPrice ? ((entry.precio - ownPrice) / ownPrice) * 100 : 0;
        return {
          id: entry.idPrecioComp,
          productName: product?.nombre ?? "Producto n/d",
          competitorName: competitor?.nombre ?? "Competidor n/d",
          competitorPrice: entry.precio,
          ownPrice,
          url: entry.urlProducto,
          diffPercent,
          timestamp: entry.timestamp,
        };
      })
      .sort((a, b) => a.diffPercent - b.diffPercent);
  }, [latestOwnPriceByProduct]);

  const leadsPerCliente = useMemo(() => {
    return mockLeadInsights.reduce<Record<number, number>>((acc, insight) => {
      acc[insight.idCliente] = (acc[insight.idCliente] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const zonaThresholds = useMemo(() => {
    return mockDimZona.map((zona) => {
      const clientesZona = mockClientes.filter(
        (cliente) => cliente.zona === zona.zona && cliente.ciudad === zona.ciudad,
      );
      const backlog = clientesZona.reduce((total, cliente) => total + (leadsPerCliente[cliente.idCliente] ?? 0), 0);
      const slaTarget = zona.region === "Este" ? "4h" : zona.region === "Oeste" ? "5h" : "6h";
      const churnLimit = zona.region === "Este" ? "1.8%" : zona.region === "Oeste" ? "2.2%" : "2.5%";
      return {
        ...zona,
        backlog,
        slaTarget,
        churnLimit,
      };
    });
  }, [leadsPerCliente]);

  const scraperSources = mockCompetidores.map((competidor) => ({
    name: competidor.nombre,
    scope: `Scraper (${competidor.metodoExtraccion.replace(/_/g, ' ')})`,
    status: competidor.activo ? "Activo" : "En pausa",
    lastSync: "2024-10-15T04:30:00Z",
    owner: "Data Ops",
  }));

  const toggleChannel = (channel: ChannelKey) => {
    setChannelState((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Configuración</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Automatizaciones & gobierno</h1>
          <span className="pill">Admin</span>
        </div>
        <p className="text-sm text-slate-500">
          Orquesta alertas competitivas, roles y conectores críticos desde un solo lugar.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="space-y-5 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="flex flex-wrap items-start gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gestión de alertas</p>
              <p className="text-xl font-semibold text-slate-900">Precios competitivos</p>
            </div>
            <span className="pill">{alertRows.length} reglas</span>
          </header>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Disparo cuando</span>
                  <span>{alertThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={alertThreshold}
                  onChange={(event) => setAlertThreshold(Number(event.target.value))}
                  className="w-full accent-rose-500"
                />
                <p className="text-xs text-slate-500">
                  Notificaremos si el precio externo cae {alertThreshold}% por debajo del nuestro.
                </p>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={autoPause}
                  onChange={() => setAutoPause((prev) => !prev)}
                  className="h-4 w-4 accent-rose-500"
                />
                Pausar listas en ecommerce cuando dispare la alerta
              </label>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Canales</p>
              {(
                [
                  { key: "email", label: "Email", detail: "Reporte diario" },
                  { key: "slack", label: "Slack #pricing-war-room", detail: "Inmediato" },
                  { key: "sms", label: "SMS Ejecutivos", detail: "Solo gaps >20%" },
                ] as const
              ).map((channel) => (
                <button
                  key={channel.key}
                  type="button"
                  onClick={() => toggleChannel(channel.key)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    channelState[channel.key]
                      ? "border-rose-200 bg-rose-50/70 text-rose-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <span>
                    {channel.label}
                    <span className="block text-xs font-normal text-slate-500">{channel.detail}</span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em]">
                    {channelState[channel.key] ? "ON" : "OFF"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th>Producto</th>
                  <th>Competidor</th>
                  <th>Precio externo</th>
                  <th>Precio propio</th>
                  <th>Diferencia</th>
                  <th>Último pull</th>
                </tr>
              </thead>
              <tbody>
                {alertRows.map((row) => (
                  <tr key={row.id} className="rounded-2xl bg-slate-50/60 text-slate-700">
                    <td className="rounded-l-2xl px-4 py-3 font-semibold text-slate-900">{row.productName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{row.competitorName}</p>
                      <a className="text-xs font-semibold text-rose-600" href={row.url} target="_blank" rel="noreferrer">
                        Ver enlace ↗
                      </a>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-600">
                      {currencyFormatter.format(row.competitorPrice)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.ownPrice ? currencyFormatter.format(row.ownPrice) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.diffPercent <= -alertThreshold
                            ? "bg-rose-100 text-rose-700"
                            : row.diffPercent < -5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {row.diffPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="rounded-r-2xl px-4 py-3 text-xs text-slate-500">
                      {row.timestamp.toLocaleString("es-BO", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Roles</p>
            <p className="text-lg font-semibold text-slate-900">Gobierno de accesos</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {roleDefinitions.map((role) => (
                <div key={role.name} className="rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{role.name}</p>
                    <span className="text-xs text-slate-400">{role.members} miembros</span>
                  </div>
                  <p className="text-xs text-slate-500">{role.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{role.scope}</span>
                    <span
                      className={`rounded-full px-2 py-1 font-semibold ${
                        role.critical ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {role.critical ? "Crítico" : "Controlado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
            >
              Gestionar directorio
            </button>
          </article>

          <article className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Logs</p>
            <p className="text-lg font-semibold text-slate-900">Actividad administrativa</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {adminLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="font-semibold text-slate-900">{log.actor}</p>
                  <p className="text-xs text-slate-500">{log.action}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    <span>{log.scope}</span>
                    <span>{dateTimeFormatter.format(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Exportar CSV
            </button>
          </article>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <article className="space-y-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Umbrales operativos</p>
              <p className="text-xl font-semibold text-slate-900">DimZona + LeadInsights</p>
            </div>
            <span className="pill">{zonaThresholds.length} zonas</span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th>Zona</th>
                  <th>Ciudad</th>
                  <th>Región</th>
                  <th>Backlog de leads</th>
                  <th>SLA objetivo</th>
                  <th>Churn máximo</th>
                </tr>
              </thead>
              <tbody>
                {zonaThresholds.map((zona) => (
                  <tr key={`${zona.zona}-${zona.ciudad}`} className="rounded-2xl bg-slate-50/70">
                    <td className="rounded-l-2xl px-4 py-3 font-semibold text-slate-900">{zona.zona}</td>
                    <td className="px-4 py-3 text-slate-600">{zona.ciudad}</td>
                    <td className="px-4 py-3 text-slate-600">{zona.region}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{zona.backlog}</td>
                    <td className="px-4 py-3 text-slate-700">{zona.slaTarget}</td>
                    <td className="rounded-r-2xl px-4 py-3 text-slate-700">{zona.churnLimit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="space-y-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <header className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Integraciones</p>
              <p className="text-xl font-semibold text-slate-900">Fuentes activas</p>
            </div>
            <span className="pill">{scraperSources.length + integrationCatalog.erp.length + integrationCatalog.bi.length}</span>
          </header>
          <div className="space-y-5 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scrapers</p>
              <div className="mt-3 space-y-3">
                {scraperSources.map((source) => (
                  <div key={source.name} className="rounded-2xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      {source.name}
                      <span className="text-xs text-slate-400">{source.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{source.scope}</p>
                    <p className="text-xs text-slate-400">{source.owner} · {dateTimeFormatter.format(new Date(source.lastSync))}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">ERP & operaciones</p>
              <div className="mt-3 space-y-3">
                {integrationCatalog.erp.map((entry) => (
                  <div key={entry.name} className="rounded-2xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      {entry.name}
                      <span className="text-xs text-slate-400">{entry.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{entry.scope}</p>
                    <p className="text-xs text-slate-400">{entry.owner} · {dateTimeFormatter.format(new Date(entry.lastSync))}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">BI</p>
              <div className="mt-3 space-y-3">
                {integrationCatalog.bi.map((entry) => (
                  <div key={entry.name} className="rounded-2xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      {entry.name}
                      <span className="text-xs text-slate-400">{entry.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{entry.scope}</p>
                    <p className="text-xs text-slate-400">{entry.owner} · {dateTimeFormatter.format(new Date(entry.lastSync))}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}

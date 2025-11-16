import { fetchClientes, type ClienteRecord } from "@/lib/api/clientes";
import { mockClientes } from "@/lib/mock-data";

type ClienteLike = ClienteRecord | (typeof mockClientes)[number];

const extractZoneLabel = (cliente: ClienteLike): string => {
  const source = cliente as Record<string, unknown>;
  const zoneCandidate = source.zona;
  if (typeof zoneCandidate === "string" && zoneCandidate.trim()) return zoneCandidate.trim();
  const cityCandidate = source.ciudad;
  if (typeof cityCandidate === "string" && cityCandidate.trim()) return cityCandidate.trim();
  return "Sin zona";
};

const buildZoneHistogram = (clientes: ClienteLike[]) => {
  const counts = clientes.reduce<Record<string, number>>((acc, cliente) => {
    const zone = extractZoneLabel(cliente);
    acc[zone] = (acc[zone] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([zone, total]) => ({ zone, total }))
    .sort((a, b) => b.total - a.total);
};

export default async function AnalyticsPage() {
  let clientes: ClienteLike[] = [];
  let clientesError: string | null = null;
  let usingFallback = false;

  try {
    const response = await fetchClientes();
    clientes = response;
  } catch (error) {
    clientesError = error instanceof Error ? error.message : "Error desconocido";
    clientes = mockClientes;
    usingFallback = true;
  }

  const zoneHistogram = buildZoneHistogram(clientes);
  const topZoneHistogram = zoneHistogram.slice(0, 6);
  const maxZoneCount = topZoneHistogram[0]?.total ?? 1;

  return (
    <section className="space-y-8">
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clientes</p>
            <p className="text-xl font-semibold text-slate-900">Concentración por zona</p>
          </div>
          <span className="pill">Top {topZoneHistogram.length || 0}</span>
        </header>
        {clientesError && (
          <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-2 text-sm text-amber-700">
            No pudimos actualizar la data de clientes ({clientesError}). {usingFallback ? "Mostramos los registros locales de referencia." : "Intenta nuevamente."}
          </p>
        )}
        {topZoneHistogram.length ? (
          <div className="space-y-4">
            {topZoneHistogram.map(({ zone, total }) => (
              <div key={zone} className="space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{zone}</span>
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
      </section>
    </section>
  );
}

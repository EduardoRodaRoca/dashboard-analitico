const metrics = [
  { label: "Visitas totales", value: "182.4K", change: "+18%", detail: "Últimos 30 días" },
  { label: "Tasa de conversión", value: "4.6%", change: "+0.8pp", detail: "Email + Paid" },
  { label: "Ticket promedio", value: "$1,320", change: "-3%", detail: "Quarter to date" },
];

const cohortData = [
  { cohort: "Semana 32", retention: 78, revenue: "$62K" },
  { cohort: "Semana 33", retention: 74, revenue: "$55K" },
  { cohort: "Semana 34", retention: 69, revenue: "$48K" },
  { cohort: "Semana 35", retention: 66, revenue: "$43K" },
];

const funnelSteps = [
  { step: "Visitas", value: "182,412", pct: "100%" },
  { step: "Evaluación", value: "58,910", pct: "32%" },
  { step: "Demo", value: "12,441", pct: "6.8%" },
  { step: "Cierre", value: "2,104", pct: "1.1%" },
];

export default function AnalyticsPage() {
  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Analytics</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Panel de comportamiento</h1>
          <span className="pill">Actualizado realtime</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Basado en eventos de Vercel Web Analytics y data warehouse Snowflake.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
            <p className="text-sm font-semibold text-rose-600">{metric.change}</p>
            <p className="text-xs text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Retención</p>
              <p className="text-xl font-semibold text-slate-900">Cohortes recientes</p>
            </div>
            <button type="button" className="text-sm font-semibold text-rose-600">
              Exportar CSV
            </button>
          </div>
          <div className="space-y-4">
            {cohortData.map((row) => (
              <div key={row.cohort} className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{row.cohort}</span>
                  <span>{row.revenue}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                    style={{ width: `${row.retention}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Retención {row.retention}%</p>
              </div>
            ))}
          </div>
        </article>

        <article className="space-y-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Embudo</p>
              <p className="text-xl font-semibold text-slate-900">Conversiones por etapa</p>
            </div>
            <span className="pill">Q4</span>
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{step.step}</p>
                  <p className="text-xs text-slate-500">{step.value} · {step.pct}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

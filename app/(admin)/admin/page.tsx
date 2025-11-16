const kpis = [
  {
    label: "Ingresos MRR",
    value: "$248K",
    trend: "+12.4% vs last month",
    detail: "Renovaciones 86%",
  },
  {
    label: "Clientes activos",
    value: "1,482",
    trend: "+58 nuevos",
    detail: "Churn 2.1%",
  },
  {
    label: "Tiempo a valor",
    value: "12 días",
    trend: "-3 días vs meta",
    detail: "Onboarding 92%",
  },
  {
    label: "NPS",
    value: "67",
    trend: "+4 puntos",
    detail: "Última encuesta 09/10",
  },
];

const pipeline = [
  { stage: "Descubrimiento", value: "$412K", progress: 72 },
  { stage: "Evaluación", value: "$231K", progress: 54 },
  { stage: "Negociación", value: "$189K", progress: 38 },
];

const activities = [
  {
    title: "Revisión trimestral con Infinia",
    owner: "Camila",
    time: "Hoy · 16:30",
    status: "Confirmada",
  },
  {
    title: "Demo técnica Retail Nova",
    owner: "Juanca",
    time: "Hoy · 12:00",
    status: "Listo",
  },
  {
    title: "Comité de riesgos",
    owner: "Anabel",
    time: "Mañana · 09:30",
    status: "Pendiente",
  },
];

const leaderboard = [
  { name: "Camila Ríos", role: "Revenue Ops", score: 94, delta: "+8" },
  { name: "Juanca Paredes", role: "Ventas Enterprise", score: 88, delta: "+3" },
  { name: "Anabel Flores", role: "Customer Success", score: 85, delta: "+6" },
];

const announcements = [
  {
    title: "Nuevo playbook de cuentas estratégicas",
    detail: "Disponible en Confluence > go/vanguarda-playbook",
  },
  {
    title: "Actualización de roles y permisos",
    detail: "Configura aprobaciones en Configuración > Seguridad",
  },
];

export default function AdminHome() {
  return (
    <section className="space-y-8">
      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-md shadow-slate-200/60"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{kpi.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{kpi.value}</p>
              <p className="mt-2 text-sm font-medium text-rose-600">{kpi.trend}</p>
              <p className="text-xs text-slate-500">{kpi.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="space-y-6 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-md shadow-slate-200/60 lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pipeline</p>
              <p className="text-xl font-semibold text-slate-900">Progreso semanal</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
            >
              Ver embudo
            </button>
          </header>
          <div className="space-y-4">
            {pipeline.map((item) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{item.stage}</span>
                  <span>{item.value}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-md shadow-slate-200/60">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Agenda</p>
              <p className="text-xl font-semibold text-slate-900">Próximos focos</p>
            </div>
            <span className="pill">3 eventos</span>
          </header>
          <div className="mt-5 space-y-5">
            {activities.map((activity) => (
              <div key={activity.title} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-base font-semibold text-slate-900">{activity.title}</p>
                <p className="text-sm text-slate-500">{activity.owner} · {activity.time}</p>
                <p className="mt-1 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                  {activity.status}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="space-y-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-md shadow-slate-200/60 lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Equipo</p>
              <p className="text-xl font-semibold text-slate-900">Leaderboard semanal</p>
            </div>
            <button type="button" className="text-sm font-semibold text-rose-600">
              Ver todo
            </button>
          </header>
          <div className="divide-y divide-slate-100">
            {leaderboard.map((member) => (
              <div key={member.name} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900">{member.score}</p>
                  <p className="text-sm font-medium text-rose-600">{member.delta}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="space-y-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-md shadow-slate-200/60">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Comunicados</p>
            <p className="text-xl font-semibold text-slate-900">Información clave</p>
          </header>
          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
            <button
              type="button"
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
            >
              Ver histórico
            </button>
          </div>
        </article>
      </section>
    </section>
  );
}

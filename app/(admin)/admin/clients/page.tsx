import { fetchClientes, type ClienteRecord } from "@/lib/api/clientes";
import { mockClientes, mockLeadInsights, mockPedidos } from "@/lib/mock-data";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import Image from "next/image";
import { ClientCardActions, ClientCreateButton } from "./client-actions";

type ClienteLite = {
  idCliente: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  zona: string;
  ciudad: string;
  pais: string;
  canalOrigen: string;
  fechaRegistro: Date;
  imageUrl?: string;
};
type LeadInsightType = (typeof mockLeadInsights)[number];
type PedidoType = (typeof mockPedidos)[number];

const currencyFormatter = new Intl.NumberFormat("es-BO", { style: "currency", currency: "USD" });

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });

type CrmFicha = {
  cliente: ClienteLite;
  pedidos: PedidoType[];
  confirmados: PedidoType[];
  pendientes: PedidoType[];
  montoConfirmado: number;
  montoPendiente: number;
  ultimoInsight?: LeadInsightType;
  ultimaActividad?: Date;
  etapa: string;
};

const buildCrmFichas = (clientes: ClienteLite[]): CrmFicha[] =>
  clientes
    .map((cliente: ClienteLite) => {
      const pedidos = mockPedidos.filter((pedido: PedidoType) => pedido.idCliente === cliente.idCliente);
      const leads = mockLeadInsights
        .filter((lead: LeadInsightType) => lead.idCliente === cliente.idCliente)
        .sort((a: LeadInsightType, b: LeadInsightType) => b.fechaRegistro.getTime() - a.fechaRegistro.getTime());
      const ultimoInsight = leads[0];
      const confirmados = pedidos.filter((pedido: PedidoType) => pedido.estado === "CONFIRMADO");
      const pendientes = pedidos.filter((pedido: PedidoType) => pedido.estado === "PENDIENTE");
      const montoConfirmado = confirmados.reduce((acc: number, pedido: PedidoType) => acc + pedido.montoTotal, 0);
      const montoPendiente = pendientes.reduce((acc: number, pedido: PedidoType) => acc + pedido.montoTotal, 0);
      const ultimaActividad = ultimoInsight?.fechaRegistro ?? pedidos[0]?.fechaCreacion ?? cliente.fechaRegistro;

      const etapa = (() => {
        if (confirmados.length) return "Cliente activo";
        if (pendientes.length) return "En negociación";
        if (leads.length) return "Lead calificado";
        return "Nuevo";
      })();

      return {
        cliente,
        pedidos,
        confirmados,
        pendientes,
        montoConfirmado,
        montoPendiente,
        ultimoInsight,
        ultimaActividad,
        etapa,
      };
    })
    .sort(
      (a: CrmFicha, b: CrmFicha) =>
        b.montoConfirmado + b.montoPendiente - (a.montoConfirmado + a.montoPendiente),
    );

const stageTone: Record<string, string> = {
  "Cliente activo": "bg-emerald-100 text-emerald-700",
  "En negociación": "bg-amber-100 text-amber-700",
  "Lead calificado": "bg-slate-100 text-slate-600",
  Nuevo: "bg-slate-200 text-slate-500",
};

const normalizeClienteRecord = (record: ClienteRecord): ClienteLite => ({
  idCliente: record.idCliente,
  nombreCompleto: record.nombreCompleto,
  email: record.email,
  telefono: record.telefono,
  zona: record.zona,
  ciudad: record.ciudad,
  pais: record.pais,
  canalOrigen: record.canalOrigen,
  fechaRegistro: record.fechaRegistro ? new Date(record.fechaRegistro) : new Date(),
  imageUrl: typeof record.imageUrl === "string" && record.imageUrl.length
    ? record.imageUrl
    : typeof record.image_url === "string" && record.image_url.length
      ? record.image_url
      : undefined,
});

const mapMockCliente = (cliente: (typeof mockClientes)[number]): ClienteLite => ({
  idCliente: cliente.idCliente,
  nombreCompleto: cliente.nombreCompleto,
  email: cliente.email,
  telefono: cliente.telefono,
  zona: cliente.zona,
  ciudad: cliente.ciudad,
  pais: cliente.pais,
  canalOrigen: cliente.canalOrigen,
  fechaRegistro: cliente.fechaRegistro,
  imageUrl: cliente.imageUrl,
});

const serializeClienteForActions = (cliente: ClienteLite) => ({
  idCliente: cliente.idCliente,
  nombreCompleto: cliente.nombreCompleto,
  email: cliente.email,
  telefono: cliente.telefono,
  zona: cliente.zona,
  ciudad: cliente.ciudad,
  pais: cliente.pais,
  canalOrigen: cliente.canalOrigen,
  fechaRegistro: cliente.fechaRegistro.toISOString(),
  imageUrl: cliente.imageUrl,
});

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "CL";

export default async function ClientsPage() {
  let clientes: ClienteLite[] = [];
  let fetchError: string | null = null;
  let usingFallback = false;

  try {
    const response = await fetchClientes();
    clientes = response.map(normalizeClienteRecord);
    if (!clientes.length) throw new Error("Respuesta vacía de clientes");
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Error desconocido";
    clientes = mockClientes.map(mapMockCliente);
    usingFallback = true;
  }

  const crmFichas = buildCrmFichas(clientes);

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clientes</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Cuentas estratégicas</h1>
          <ClientCreateButton />
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
          >
            Importar
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          CRM ligero para monitorear cuentas B2B, motivaciones de compra y pipeline asociado.
        </p>
        {fetchError && (
          <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-2 text-sm text-rose-700">
            No pudimos cargar clientes desde la API ({fetchError}). {usingFallback ? "Mostramos la base local como referencia." : "Intenta nuevamente."}
          </p>
        )}
      </header>

      <section className="space-y-4">
        {crmFichas.map((ficha: CrmFicha) => {
          const { cliente, etapa, pedidos, montoConfirmado, montoPendiente, ultimoInsight, ultimaActividad } = ficha;
          const photoUrl = resolveMediaUrl(cliente.imageUrl);
          return (
            <article key={cliente.idCliente} className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold uppercase text-slate-500">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={`Foto de ${cliente.nombreCompleto}`}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  ) : (
                    getInitials(cliente.nombreCompleto)
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{cliente.zona}</p>
                  <p className="text-xl font-semibold text-slate-900">{cliente.nombreCompleto}</p>
                  <p className="text-xs text-slate-500">
                    {cliente.ciudad}, {cliente.pais} · {cliente.canalOrigen}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageTone[etapa]}`}>{etapa}</span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Valor confirmado</p>
                  <p className="text-base font-semibold text-slate-900">
                    {montoConfirmado ? currencyFormatter.format(montoConfirmado) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pipeline</p>
                  <p className="text-base font-semibold text-slate-900">
                    {montoPendiente ? currencyFormatter.format(montoPendiente) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pedidos</p>
                  <p className="text-base font-semibold text-slate-900">{pedidos.length}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Insight más reciente</p>
                {ultimoInsight ? (
                  <>
                    <p className="mt-2 font-semibold text-slate-900">{ultimoInsight.motivoCompraCategoria}</p>
                    <p className="mt-1">{ultimoInsight.motivoCompraTexto}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-rose-500">
                      {ultimoInsight.comoNosConocio} · {ultimoInsight.canalRespuesta}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Aún no hay feedback registrado.</p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-900">Última actividad:</p>
                <span>{ultimaActividad ? formatDate(ultimaActividad) : "—"}</span>
                <span className="text-slate-400">•</span>
                <a href={`mailto:${cliente.email}`} className="font-semibold text-rose-600">
                  {cliente.email}
                </a>
                <span className="text-slate-400">/</span>
                <a href={`tel:${cliente.telefono}`} className="font-semibold text-slate-900">
                  {cliente.telefono}
                </a>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Abrir timeline
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Registrar nota
                </button>
                <ClientCardActions cliente={serializeClienteForActions(cliente)} />
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}

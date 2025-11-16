import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel Administrativo",
  description: "Dashboard modular inspirado en el template de Vercel",
};

const navItems = [
  { label: "Productos", href: "/admin/products", summary: "Catálogo y precios" },
  { label: "Clientes", href: "/admin/clients", summary: "Leads y cuentas" },
  { label: "Pedidos", href: "/admin/orders", summary: "Pipeline y operaciones" },
  { label: "Analytics", href: "/admin/analytics", summary: "Cohortes y hotspots" },
  { label: "Competencia", href: "/admin/competition", summary: "Comparativo mercado" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-base antialiased text-base-foreground`}
      >
        <div className="min-h-screen bg-base">
          <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row lg:px-8">
            <aside className="lg:w-64">
              <div className="sticky top-10 flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-rose-100/40 backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Vanguarda</p>
                      <p className="text-lg text-slate-900">Admin Center</p>
                    </div>
                    <span className="pill">v1.0</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    Plantilla inspirada en el dashboard de Vercel, optimizada para equipos de análisis.
                  </p>
                </div>
                <SidebarNav items={navItems} />
                <div className="rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-red-500 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Prioridad</p>
                  <p className="mt-2 text-lg font-semibold">
                    Lanzamiento trimestral en 12 días.
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Revisa los indicadores críticos y comparte el plan con tu equipo.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-white"
                    >
                      Revisar plan
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-white/60 bg-transparent px-3 py-2 text-sm font-semibold"
                    >
                      Invitar
                    </button>
                  </div>
                </div>
              </div>
            </aside>
            <div className="flex-1 space-y-6 pb-10">
              <header className="rounded-3xl border border-white/40 bg-white/90 px-6 py-5 shadow-lg shadow-slate-200/60 backdrop-blur">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <Breadcrumbs items={navItems} />
                    <p className="text-2xl font-semibold text-slate-900">Dashboard Ejecutivo</p>
                  </div>
                </div>
              </header>
              <main className="space-y-6">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

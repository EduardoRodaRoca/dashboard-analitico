import { fetchProductos, type ProductoRecord } from "@/lib/api/productos";
import { mockPreciosPropios, mockProductos } from "@/lib/mock-data";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import Image from "next/image";
import { ProductCreateButton, ProductRowActions } from "./product-actions";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(value);

const latestPrices = mockPreciosPropios.reduce<Record<number, typeof mockPreciosPropios[number]>>(
  (acc, precio) => {
    if (!acc[precio.idProducto] || (acc[precio.idProducto].fechaInicio < precio.fechaInicio && !precio.fechaFin)) {
      acc[precio.idProducto] = precio;
    }
    return acc;
  },
  {},
);
const normalizeProductImage = (producto: ProductoRecord) => {
  const urlCandidates = [producto.imageUrl, (producto as Record<string, unknown>).image_url];
  const resolved = urlCandidates.find((value): value is string => typeof value === "string" && value.length > 0);
  return resolveMediaUrl(resolved);
};

const addImageToProductos = (items: ProductoRecord[]) =>
  items.map((producto) => ({
    ...producto,
    imageUrl: normalizeProductImage(producto),
  }));

const getProductoMonogram = (nombre: string) => nombre.trim().slice(0, 2).toUpperCase() || "PR";

export default async function ProductsPage() {
  let productos: ProductoRecord[] = [];
  let fetchError: string | null = null;
  let usingFallback = false;

  try {
    const response = await fetchProductos();
    if (!Array.isArray(response) || !response.length) {
      throw new Error("Respuesta vacía de productos");
    }
    productos = response;
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Error desconocido";
    productos = mockProductos.map((producto) => ({
      idProducto: producto.idProducto,
      skuInterno: producto.skuInterno,
      nombre: producto.nombre,
      categoria: producto.categoria,
      marca: producto.marca,
      activo: producto.activo,
      imageUrl: producto.imageUrl,
    }));
    usingFallback = true;
  }

  productos = addImageToProductos(productos);

  const productDictionary = new Map(productos.map((producto) => [producto.idProducto, producto]));
  const productCount = productos.length;
  const activeCount = productos.filter((producto) => producto.activo).length;
  const inactiveCount = productCount - activeCount;

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Catálogo</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Productos y precios</h1>
          <ProductCreateButton />
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
          >
            Exportar CSV
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Controla disponibilidad, márgenes y recursos visuales antes de lanzar nuevas campañas.
        </p>
      </header>
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
        <article className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Listado</p>
              <p className="text-xl font-semibold text-slate-900">{productCount} productos</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-3 text-sm text-slate-500">
              <button type="button" className="rounded-full border border-slate-200 px-3 py-1 hover:text-rose-600">
                Todos
              </button>
              <button type="button" className="rounded-full border border-slate-200 px-3 py-1 hover:text-rose-600">
                Activos ({activeCount})
              </button>
              <button type="button" className="rounded-full border border-slate-200 px-3 py-1 hover:text-rose-600">
                Inactivos ({inactiveCount})
              </button>
            </div>
          </div>
          {fetchError && (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
              No pudimos cargar los productos desde la API ({fetchError}). {usingFallback ? "Mostramos el catalogo local como referencia." : "Intenta nuevamente."}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio vigente</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => {
                  const precio = latestPrices[producto.idProducto];
                  return (
                    <tr key={producto.idProducto} className="rounded-2xl bg-slate-50/80 text-slate-700">
                      <td className="rounded-l-2xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                            {producto.imageUrl ? (
                              <Image
                                src={producto.imageUrl}
                                alt={`Foto de ${producto.nombre}`}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                                sizes="56px"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-400">
                                {getProductoMonogram(producto.nombre)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{producto.nombre}</p>
                            <p className="text-xs text-slate-500">
                              SKU {producto.skuInterno} · {producto.marca}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{producto.categoria}</td>
                      <td className="px-4 py-3 font-semibold">
                        {precio ? formatCurrency(precio.precio, precio.moneda) : "-"}
                        {precio?.fuente === "promo" && (
                          <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                            Promo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            producto.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {producto.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="rounded-r-2xl px-4 py-3 text-right">
                        <ProductRowActions producto={producto} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-sm">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Historial de precios</p>
            <p className="text-xl font-semibold text-slate-900">Movimientos recientes</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
          >
            Descargar log
          </button>
        </header>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {mockPreciosPropios.slice(0, 6).map((precio) => {
            const producto = productDictionary.get(precio.idProducto);
            return (
              <div key={precio.idPrecio} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">{producto?.nombre ?? `Producto ${precio.idProducto}`}</p>
                <p className="text-xs text-slate-500">{producto?.skuInterno ?? `SKU n/d`}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatCurrency(precio.precio, precio.moneda)}
                </p>
                <p className="text-xs text-slate-500">
                  {precio.fechaInicio.toLocaleDateString("es-BO")}
                  {precio.fechaFin ? ` → ${precio.fechaFin.toLocaleDateString("es-BO")}` : " · vigente"}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {precio.fuente}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

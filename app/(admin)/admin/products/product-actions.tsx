"use client";

import { MultiImageUploadField } from "@/components/multi-image-upload-field";
import {
  createProducto,
  deleteProducto,
  updateProducto,
  type ProductoCreatePayload,
  type ProductoRecord,
  type ProductoUpdatePayload,
} from "@/lib/api/productos";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState, useTransition } from "react";

const initialProductState = () => ({
  skuInterno: "",
  nombre: "",
  categoria: "",
  marca: "",
  anchoCm: "",
  altoCm: "",
  caracteristicas: "",
  acabados: "",
  activo: true,
  imageUrls: [] as string[],
});

type ProductFormValues = ReturnType<typeof initialProductState>;

const MAX_PRODUCT_IMAGES = 3;

const parseList = (value: string) =>
  value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

const generateProductoId = () => {
  // Timestamp plus a random suffix keeps ids unique without asking the user for them.
  const timeComponent = Date.now();
  const randomComponent = Math.floor(Math.random() * 1000);
  return Number(`${timeComponent}${randomComponent.toString().padStart(3, "0")}`);
};

const parseOptionalNumber = (raw: string, label: string): number | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`El campo ${label} debe ser numérico.`);
  }
  return parsed;
};

const sanitizeImageList = (values: string[]): string[] =>
  values
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, MAX_PRODUCT_IMAGES);

const pickValue = (record: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (key in record) {
      const value = record[key];
      if (value !== undefined && value !== null) return value;
    }
  }
  return undefined;
};

const ensureStringValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const ensureNumberString = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value;
  return "";
};

const ensureArrayCsv = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : typeof entry === "number" ? String(entry) : ""))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "string") return value;
  return "";
};

const extractImageList = (producto: ProductoRecord): string[] => {
  const source = producto as Record<string, unknown>;
  const rawList = pickValue(source, "imageUrls", "image_urls");
  let gallery: string[] = [];
  if (Array.isArray(rawList)) {
    gallery = rawList
      .map((entry) => (typeof entry === "string" ? entry : typeof entry === "number" ? String(entry) : ""))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (!gallery.length) {
    const fallback = pickValue(source, "imageUrl", "image_url");
    if (typeof fallback === "string" && fallback.trim()) {
      gallery = [fallback.trim()];
    }
  }
  return gallery.slice(0, MAX_PRODUCT_IMAGES);
};

const buildBasePayload = (values: ProductFormValues): Omit<ProductoCreatePayload, "id_producto" | "fecha_creacion"> => {
  const payload: Omit<ProductoCreatePayload, "id_producto" | "fecha_creacion"> = {
    sku_interno: values.skuInterno.trim(),
    nombre: values.nombre.trim(),
    categoria: values.categoria.trim(),
    marca: values.marca.trim(),
    activo: values.activo,
  };

  const ancho = parseOptionalNumber(values.anchoCm, "ancho en cm");
  if (typeof ancho !== "undefined") payload.ancho_cm = ancho;

  const alto = parseOptionalNumber(values.altoCm, "alto en cm");
  if (typeof alto !== "undefined") payload.alto_cm = alto;

  const features = parseList(values.caracteristicas);
  if (features.length) payload.caracteristicas = features;

  const finishes = parseList(values.acabados);
  if (finishes.length) payload.acabados = finishes;

  const gallery = sanitizeImageList(values.imageUrls ?? []);
  payload.imageUrls = gallery;
  if (gallery.length) {
    payload.image_url = gallery[0];
  } else {
    delete (payload as Record<string, unknown>).image_url;
  }

  return payload;
};

const valuesToCreatePayload = (values: ProductFormValues): ProductoCreatePayload => ({
  id_producto: generateProductoId(),
  fecha_creacion: new Date().toISOString(),
  ...buildBasePayload(values),
});

const valuesToUpdatePayload = (values: ProductFormValues): ProductoUpdatePayload => ({
  ...buildBasePayload(values),
});

const productoToFormValues = (producto: ProductoRecord): ProductFormValues => {
  const base = initialProductState();
  const source = producto as Record<string, unknown>;

  base.skuInterno = ensureStringValue(pickValue(source, "skuInterno", "sku_interno") ?? base.skuInterno);
  base.nombre = ensureStringValue(pickValue(source, "nombre") ?? base.nombre);
  base.categoria = ensureStringValue(pickValue(source, "categoria") ?? base.categoria);
  base.marca = ensureStringValue(pickValue(source, "marca") ?? base.marca);
  base.anchoCm = ensureNumberString(pickValue(source, "anchoCm", "ancho_cm"));
  base.altoCm = ensureNumberString(pickValue(source, "altoCm", "alto_cm"));
  base.caracteristicas = ensureArrayCsv(pickValue(source, "caracteristicas"));
  base.acabados = ensureArrayCsv(pickValue(source, "acabados"));
  base.activo = typeof producto.activo === "boolean" ? producto.activo : Boolean(pickValue(source, "activo") ?? true);
  base.imageUrls = extractImageList(producto);
  return base;
};

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ title, description, onClose, children }: ModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-8"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white p-6 shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Catálogo</p>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  </div>
);

type TextFieldName = Exclude<keyof ProductFormValues, "activo">;

type InputConfig = {
  name: TextFieldName;
  label: string;
  type?: string;
  hint?: string;
};

const productFields: InputConfig[] = [
  { name: "skuInterno", label: "SKU interno" },
  { name: "nombre", label: "Nombre" },
  { name: "categoria", label: "Categoría" },
  { name: "marca", label: "Marca" },
  { name: "anchoCm", label: "Ancho (cm)", type: "number" },
  { name: "altoCm", label: "Alto (cm)", type: "number" },
  { name: "caracteristicas", label: "Características", hint: "Separa con comas" },
  { name: "acabados", label: "Acabados", hint: "Separa con comas" },
];

const ProductFormFields = ({
  values,
  disabled,
  onChange,
}: {
  values: ProductFormValues;
  disabled: boolean;
  onChange: <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => void;
}) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {productFields.map(({ name, label, type, hint }) => (
      <label key={name} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
        <input
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-slate-50"
          type={type ?? "text"}
          value={values[name] as string}
          disabled={disabled}
          onChange={(event) => onChange(name, event.target.value)}
          required={name !== "caracteristicas" && name !== "acabados"}
        />
        {hint && <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{hint}</span>}
      </label>
    ))}
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      <input
        type="checkbox"
        className="h-4 w-4 accent-rose-500"
        checked={values.activo}
        onChange={(event) => onChange("activo", event.target.checked)}
        disabled={disabled}
      />
      Activo en catálogo
    </label>
  </div>
);

export function ProductCreateButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ProductFormValues>(() => initialProductState());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setValues(initialProductState());
    setErrorMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const payload = valuesToCreatePayload(values);
        await createProducto(payload);
        resetForm();
        setOpen(false);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No pudimos crear el producto");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
      >
        Crear producto
      </button>
      {open && (
        <Modal title="Registrar producto" description="Sube referencias y atributos clave" onClose={() => setOpen(false)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <ProductFormFields values={values} disabled={isPending} onChange={handleInputChange} />
            <MultiImageUploadField
              label="Fotos del producto"
              folder="productos"
              values={values.imageUrls}
              disabled={isPending}
              onChangeAction={(urls) => setValues((prev) => ({ ...prev, imageUrls: urls }))}
              helperText="Hasta 3 imágenes · la primera se mostrará en el catálogo"
            />
            {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function ProductRowActions({ producto }: { producto: ProductoRecord }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [values, setValues] = useState<ProductFormValues>(() => productoToFormValues(producto));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const resetEditState = () => {
    setValues(productoToFormValues(producto));
    setErrorMessage(null);
  };

  const handleInputChange = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const payload = valuesToUpdatePayload(values);
        await updateProducto(producto.idProducto, payload);
        setEditOpen(false);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No pudimos actualizar el producto");
      }
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteProducto(producto.idProducto);
        setDeleteOpen(false);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "No pudimos eliminar el producto");
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
          onClick={() => {
            resetEditState();
            setEditOpen(true);
          }}
        >
          Editar
        </button>
        <button
          type="button"
          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          onClick={() => {
            setDeleteError(null);
            setDeleteOpen(true);
          }}
        >
          Eliminar
        </button>
      </div>

      {editOpen && (
        <Modal
          title={`Editar ${producto.nombre}`}
          description={`SKU ${producto.skuInterno}`}
          onClose={() => {
            setEditOpen(false);
            resetEditState();
          }}
        >
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <ProductFormFields values={values} disabled={isPending} onChange={handleInputChange} />
            <MultiImageUploadField
              label="Fotos del producto"
              folder="productos"
              values={values.imageUrls}
              disabled={isPending}
              onChangeAction={(urls) => setValues((prev) => ({ ...prev, imageUrls: urls }))}
              helperText="Hasta 3 fotos · la primera queda como portada"
            />
            {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Actualizar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetEditState();
                  setEditOpen(false);
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteOpen && (
        <Modal
          title={`Eliminar ${producto.nombre}`}
          description="Esta acción removerá el producto del catálogo."
          onClose={() => setDeleteOpen(false)}
        >
          <p className="text-sm text-slate-600">
            Confirma si deseas eliminar el SKU <span className="font-semibold">{producto.skuInterno}</span>. Este cambio no se puede deshacer.
          </p>
          {deleteError && <p className="text-sm text-rose-600">{deleteError}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeletePending}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {isDeletePending ? "Eliminando…" : "Eliminar"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

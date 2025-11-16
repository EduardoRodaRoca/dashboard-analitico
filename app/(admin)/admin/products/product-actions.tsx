"use client";

import { ImageUploadField } from "@/components/image-upload-field";
import { createProducto } from "@/lib/api/productos";
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
  imageUrl: "",
});

type ProductFormValues = ReturnType<typeof initialProductState>;

const parseList = (value: string) =>
  value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

const valuesToPayload = (values: ProductFormValues) => {
  const payload: Record<string, unknown> = {
    skuInterno: values.skuInterno.trim(),
    nombre: values.nombre.trim(),
    categoria: values.categoria.trim(),
    marca: values.marca.trim(),
    activo: values.activo,
    fechaCreacion: new Date().toISOString(),
  };

  if (values.anchoCm) payload.anchoCm = Number(values.anchoCm);
  if (values.altoCm) payload.altoCm = Number(values.altoCm);
  if (values.caracteristicas.trim()) payload.caracteristicas = parseList(values.caracteristicas);
  if (values.acabados.trim()) payload.acabados = parseList(values.acabados);
  if (values.imageUrl.trim()) payload.image_url = values.imageUrl.trim();

  return payload;
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
        await createProducto(valuesToPayload(values));
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
            <ImageUploadField
              label="Foto del producto"
              folder="productos"
              value={values.imageUrl || null}
              disabled={isPending}
              onChangeAction={(url) => setValues((prev) => ({ ...prev, imageUrl: url ?? "" }))}
              helperText="Idealmente 1200x1200 px"
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

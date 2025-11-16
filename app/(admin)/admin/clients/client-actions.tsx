"use client";

import { createCliente, deleteCliente, updateCliente, type ClienteCreatePayload } from "@/lib/api/clientes";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useMemo, useState, useTransition } from "react";
import { ImageUploadField } from "@/components/image-upload-field";

type ClienteFormValues = {
  nombreCompleto: string;
  email: string;
  telefono: string;
  zona: string;
  ciudad: string;
  pais: string;
  canalOrigen: string;
  fechaRegistro: string;
  imageUrl: string;
};

type ClienteEditable = {
  idCliente: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  zona: string;
  ciudad: string;
  pais: string;
  canalOrigen: string;
  fechaRegistro: string;
  imageUrl?: string;
};

const fieldConfig: Array<{ name: keyof ClienteFormValues; label: string; type?: string; placeholder?: string }> = [
  { name: "nombreCompleto", label: "Nombre completo" },
  { name: "email", label: "Email", type: "email" },
  { name: "telefono", label: "Teléfono" },
  { name: "zona", label: "Zona" },
  { name: "ciudad", label: "Ciudad" },
  { name: "pais", label: "País" },
  { name: "canalOrigen", label: "Canal de origen" },
  { name: "fechaRegistro", label: "Fecha de registro", type: "date" },
];

const todayInputDate = () => new Date().toISOString().split("T")[0];

const normalizeImageUrl = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const valuesToPayload = (values: ClienteFormValues): ClienteCreatePayload => {
  const imageUrl = normalizeImageUrl(values.imageUrl);
  const payload: ClienteCreatePayload = {
    nombre_completo: values.nombreCompleto.trim(),
    email: values.email.trim(),
    telefono: values.telefono.trim(),
    zona: values.zona.trim(),
    ciudad: values.ciudad.trim(),
    pais: values.pais.trim(),
    canal_origen: values.canalOrigen.trim(),
    fecha_registro: new Date(values.fechaRegistro || todayInputDate()).toISOString(),
  };

  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  return payload;
};

const buildEmptyValues = (): ClienteFormValues => ({
  nombreCompleto: "",
  email: "",
  telefono: "",
  zona: "",
  ciudad: "",
  pais: "",
  canalOrigen: "",
  fechaRegistro: todayInputDate(),
  imageUrl: "",
});

const clienteToValues = (cliente: ClienteEditable): ClienteFormValues => ({
  nombreCompleto: cliente.nombreCompleto,
  email: cliente.email,
  telefono: cliente.telefono,
  zona: cliente.zona,
  ciudad: cliente.ciudad,
  pais: cliente.pais,
  canalOrigen: cliente.canalOrigen,
  fechaRegistro: cliente.fechaRegistro ? new Date(cliente.fechaRegistro).toISOString().split("T")[0] : todayInputDate(),
  imageUrl: cliente.imageUrl ?? "",
});

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ title, description, onClose, children }: ModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-white/70 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CRM</p>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
};

type ClienteFormFieldsProps = {
  values: ClienteFormValues;
  onChange: (field: keyof ClienteFormValues, value: string) => void;
  disabled?: boolean;
};

const optionalFields = new Set<keyof ClienteFormValues>(["telefono"]);

const ClienteFormFields = ({ values, onChange, disabled }: ClienteFormFieldsProps) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {fieldConfig.map(({ name, label, type, placeholder }) => (
      <label key={name} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
        <input
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-slate-50"
          type={type ?? "text"}
          value={values[name]}
          disabled={disabled}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          required={!optionalFields.has(name)}
        />
      </label>
    ))}
  </div>
);

const FormFooter = ({
  onCancel,
  submitLabel,
  submitting,
}: {
  onCancel: () => void;
  submitLabel: string;
  submitting: boolean;
}) => (
  <div className="flex flex-wrap gap-3">
    <button
      type="submit"
      disabled={submitting}
      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
    >
      {submitting ? "Guardando…" : submitLabel}
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
    >
      Cancelar
    </button>
  </div>
);

export const ClientCreateButton = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ClienteFormValues>(() => buildEmptyValues());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await createCliente(valuesToPayload(values));
        setOpen(false);
        setValues(buildEmptyValues());
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No pudimos guardar el cliente");
      }
    });
  };

  const handleOpen = () => {
    setValues(buildEmptyValues());
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
      >
        Nuevo lead
      </button>
      {open && (
        <Modal title="Registrar nuevo cliente" description="Crea un lead con datos básicos" onClose={() => setOpen(false)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <ClienteFormFields values={values} disabled={isPending} onChange={(field, value) => setValues((prev) => ({ ...prev, [field]: value }))} />
            <ImageUploadField
              label="Foto del cliente"
              folder="clientes"
              value={values.imageUrl || null}
              disabled={isPending}
              onChangeAction={(url) => setValues((prev) => ({ ...prev, imageUrl: url ?? "" }))}
              helperText="Mostraremos esta imagen en las tarjetas del CRM."
            />
            {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
            <FormFooter submitting={isPending} submitLabel="Guardar cliente" onCancel={() => setOpen(false)} />
          </form>
        </Modal>
      )}
    </>
  );
};

export const ClientCardActions = ({ cliente }: { cliente: ClienteEditable }) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [values, setValues] = useState<ClienteFormValues>(() => clienteToValues(cliente));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetAndClose = () => {
    setEditOpen(false);
    setValues(clienteToValues(cliente));
  };

  const handleEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await updateCliente(cliente.idCliente, valuesToPayload(values));
        setEditOpen(false);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No pudimos actualizar el cliente");
      }
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteCliente(cliente.idCliente);
        setDeleteOpen(false);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "No pudimos eliminar el cliente");
      }
    });
  };

  const lastUpdatedHint = useMemo(() => new Date(cliente.fechaRegistro).toLocaleDateString("es-BO"), [cliente.fechaRegistro]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValues(clienteToValues(cliente));
          setEditOpen(true);
        }}
        className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
      >
        Editar cliente
      </button>
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 transition hover:bg-rose-50"
      >
        Eliminar
      </button>

      {editOpen && (
        <Modal
          title={`Editar ${cliente.nombreCompleto}`}
          description={`Última actualización: ${lastUpdatedHint}`}
          onClose={resetAndClose}
        >
          <form className="space-y-4" onSubmit={handleEdit}>
            <ClienteFormFields values={values} disabled={isPending} onChange={(field, value) => setValues((prev) => ({ ...prev, [field]: value }))} />
            <ImageUploadField
              label="Foto del cliente"
              folder="clientes"
              value={values.imageUrl || null}
              disabled={isPending}
              onChangeAction={(url) => setValues((prev) => ({ ...prev, imageUrl: url ?? "" }))}
              helperText="Actualiza la foto que ves en la ficha."
            />
            {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
            <FormFooter submitting={isPending} submitLabel="Actualizar" onCancel={resetAndClose} />
          </form>
        </Modal>
      )}

      {deleteOpen && (
        <Modal
          title={`Eliminar ${cliente.nombreCompleto}`}
          description="Esta acción eliminará el lead y su histórico asociado."
          onClose={() => setDeleteOpen(false)}
        >
          <p className="text-sm text-slate-600">
            Este cambio no se puede deshacer. Confirma si deseas retirar al cliente del CRM.
          </p>
          {deleteError && <p className="text-sm text-rose-600">{deleteError}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {isPending ? "Eliminando…" : "Eliminar"}
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
};

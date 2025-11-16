"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { uploadImage } from "@/lib/api/upload-image";

export type ImageUploadFieldProps = {
  label: string;
  folder: string;
  value?: string | null;
  disabled?: boolean;
  onChangeAction: (url: string | null) => void;
  helperText?: string;
};

export function ImageUploadField({ label, folder, value, disabled, onChangeAction, helperText }: ImageUploadFieldProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file, folder);
      onChangeAction(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos subir la imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemove = () => {
    if (disabled || uploading) return;
    onChangeAction(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
          {value ? (
            <Image
              src={value}
              alt={`Vista previa de ${label.toLowerCase()}`}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-400">
              IMG
            </div>
          )}
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={disabled || uploading}
            onChange={handleFileChange}
            className="block text-xs text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-rose-600"
          />
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading || !value}
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
            >
              Quitar imagen
            </button>
            {uploading && <span className="text-rose-600">Subiendo…</span>}
          </div>
          <p className="text-xs text-slate-500">
            {helperText ?? "Hasta 5 MB · JPG, PNG o WebP"}
          </p>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

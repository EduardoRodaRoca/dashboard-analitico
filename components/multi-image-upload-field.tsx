"use client";

import Image from "next/image";
import { type ChangeEvent, useId, useRef, useState } from "react";
import { uploadImage } from "@/lib/api/upload-image";
import { resolveMediaUrl } from "@/lib/utils/media-url";

const MAX_IMAGES = 3;

type MultiImageUploadFieldProps = {
  label: string;
  folder: string;
  values: string[];
  onChangeAction: (urls: string[]) => void;
  disabled?: boolean;
  helperText?: string;
};

export function MultiImageUploadField({ label, folder, values, onChangeAction, disabled, helperText }: MultiImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) return;

    const availableSlots = MAX_IMAGES - values.length;
    if (availableSlots <= 0) {
      setError("Solo puedes subir hasta 3 imágenes.");
      event.target.value = "";
      return;
    }

    const batch = Array.from(files).slice(0, availableSlots);
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of batch) {
        const { url } = await uploadImage(file, folder);
        uploaded.push(url);
      }
      if (uploaded.length) {
        onChangeAction([...values, ...uploaded]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos subir la imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleAddClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    if (disabled || uploading) return;
    onChangeAction(values.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || uploading}
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap gap-4">
        {values.map((url, index) => {
          const previewUrl = resolveMediaUrl(url);
          return (
            <div key={`${url}-${index}`} className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={`Imagen ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-400">
                    IMG
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || uploading}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
              >
                Quitar
              </button>
            </div>
          );
        })}
        {values.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={handleAddClick}
            disabled={disabled || uploading}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs font-semibold uppercase text-slate-400 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
          >
            {uploading ? "Subiendo…" : "+ Añadir"}
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">{helperText ?? "Hasta 3 imágenes · JPG, PNG o WebP"}</p>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

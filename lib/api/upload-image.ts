const DEFAULT_UPLOAD_URL = "http://127.0.0.1:8000/api/upload-image/";

export const UPLOAD_IMAGE_URL =
  process.env.UPLOAD_IMAGE_URL ?? process.env.NEXT_PUBLIC_UPLOAD_IMAGE_URL ?? DEFAULT_UPLOAD_URL;

export type UploadResponse = {
  url: string;
};

export async function uploadImage(file: File, folder?: string): Promise<UploadResponse> {
  if (!file) throw new Error("Selecciona un archivo antes de subirlo.");
  if (file.size > 5 * 1024 * 1024) throw new Error("La imagen debe pesar menos de 5 MB.");

  const formData = new FormData();
  formData.append("image", file);
  if (folder) formData.append("folder", folder);

  const res = await fetch(UPLOAD_IMAGE_URL, {
    method: "POST",
    body: formData,
  });

  if (res.status === 201) {
    return res.json();
  }

  let detail = "No pudimos subir la imagen.";
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") {
      detail = data.detail;
    }
  } catch {
    // ignore parse errors, keep default detail
  }

  throw new Error(detail);
}

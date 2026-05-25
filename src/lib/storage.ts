import { supabase } from "./supabase";

const MENU_BUCKET = "menu-images";
const SITE_BUCKET = "site-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Solo se permiten imágenes (JPEG, PNG, WebP, GIF, AVIF)";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "La imagen no debe superar los 5MB";
  }
  return null;
}

export async function uploadMenuImage(file: File): Promise<string | null> {
  if (!supabase) return null;

  const error = validateImage(file);
  if (error) throw new Error(error);

  const fileExt = file.name.split(".").pop() || "webp";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { data, error: uploadError } = await supabase.storage
    .from(MENU_BUCKET)
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(MENU_BUCKET)
    .getPublicUrl(data.path);

  return publicUrl;
}

function getFileNameFromUrl(url: string): string {
  return url.split("/").pop()?.split("?")[0] || "";
}

export async function deleteMenuImage(url: string): Promise<void> {
  if (!supabase || !url) return;
  const fileName = getFileNameFromUrl(url);
  if (!fileName) return;
  await supabase.storage.from(MENU_BUCKET).remove([fileName]);
}

export function getImageName(url: string): string {
  return getFileNameFromUrl(url);
}

export async function uploadSiteImage(file: File): Promise<string | null> {
  if (!supabase) return null;

  const error = validateImage(file);
  if (error) throw new Error(error);

  const fileExt = file.name.split(".").pop() || "webp";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { data, error: uploadError } = await supabase.storage
    .from(SITE_BUCKET)
    .upload(fileName, file, { cacheControl: "3600", upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(SITE_BUCKET)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteSiteImage(url: string): Promise<void> {
  if (!supabase || !url) return;
  const fileName = getFileNameFromUrl(url);
  if (!fileName) return;
  await supabase.storage.from(SITE_BUCKET).remove([fileName]);
}

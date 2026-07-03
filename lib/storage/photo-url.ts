export function storageKeyFromPhotoUrl(url: string | null | undefined) {
  if (!url) return null;

  if (url.startsWith("/uploads/")) {
    return url.slice("/uploads/".length);
  }

  try {
    const { pathname } = new URL(url);
    return pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

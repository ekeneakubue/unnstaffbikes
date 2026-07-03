export function storageKeyFromPhotoUrl(url: string | null | undefined) {
  if (!url) return null;

  if (url.startsWith("/uploads/")) {
    return url.slice("/uploads/".length).split("?")[0];
  }

  if (url.startsWith("/api/photos/")) {
    return url.slice("/api/photos/".length).split("?")[0];
  }

  try {
    const { pathname } = new URL(url);
    let key = pathname.replace(/^\//, "");

    const bucketName = process.env.R2_BUCKET_NAME;
    if (bucketName && key.startsWith(`${bucketName}/`)) {
      key = key.slice(bucketName.length + 1);
    }

    return key;
  } catch {
    return null;
  }
}

function isPrivateR2Url(url: string) {
  try {
    return new URL(url).hostname.endsWith("r2.cloudflarestorage.com");
  } catch {
    return false;
  }
}

export function getPhotoSrc(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.startsWith("/api/photos/")) {
    return url.split("?")[0];
  }

  if (url.startsWith("/uploads/")) {
    const key = storageKeyFromPhotoUrl(url);
    return key ? `/api/photos/${key}` : null;
  }

  if (isPrivateR2Url(url)) {
    const key = storageKeyFromPhotoUrl(url);
    return key ? `/api/photos/${key}` : null;
  }

  return url.split("?")[0];
}

export function shouldBypassImageOptimization(url: string) {
  return (
    url.startsWith("/api/photos/") ||
    url.startsWith("/uploads/") ||
    isPrivateR2Url(url)
  );
}

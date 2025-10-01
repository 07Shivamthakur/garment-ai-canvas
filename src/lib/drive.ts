export function driveId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("drive.google.com")) return null;
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m && m[1]) return m[1];
    if (u.searchParams.has("id")) return u.searchParams.get("id");
    return null;
  } catch {
    return null;
  }
}

export function normalizeDriveUrl(url: string): string {
  const id = driveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

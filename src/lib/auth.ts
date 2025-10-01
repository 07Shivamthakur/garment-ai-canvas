import { CONFIG } from "./config";

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function genToken(len = 16): string {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface SessionToken {
  tok: string;
  exp: number;
}

export function saveToken(): SessionToken {
  const tok = genToken();
  const exp = Date.now() + CONFIG.TOKEN_TTL_MIN * 60 * 1000;
  sessionStorage.setItem("ags_tok", tok);
  sessionStorage.setItem("ags_exp", exp.toString());
  return { tok, exp };
}

export function loadToken(): SessionToken | null {
  const tok = sessionStorage.getItem("ags_tok");
  const exp = Number(sessionStorage.getItem("ags_exp") || 0);
  if (tok && exp > Date.now()) {
    return { tok, exp };
  }
  return null;
}

export function clearToken(): void {
  sessionStorage.removeItem("ags_tok");
  sessionStorage.removeItem("ags_exp");
}

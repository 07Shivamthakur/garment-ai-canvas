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

export interface Session {
  login_id: string;
  auth_token: string;
}

export function saveSession(email: string): Session {
  const auth_token = genToken(32);
  const exp = Date.now() + CONFIG.TOKEN_TTL_MIN * 60 * 1000;
  
  sessionStorage.setItem("auth_ok", "1");
  sessionStorage.setItem("login_id", email);
  sessionStorage.setItem("auth_token", auth_token);
  sessionStorage.setItem("auth_exp", exp.toString());
  
  return { login_id: email, auth_token };
}

export function loadSession(): Session | null {
  const ok = sessionStorage.getItem("auth_ok") === "1";
  const exp = Number(sessionStorage.getItem("auth_exp") || 0);
  
  if (!ok || Date.now() > exp) {
    return null;
  }
  
  return {
    login_id: sessionStorage.getItem("login_id") || "",
    auth_token: sessionStorage.getItem("auth_token") || "",
  };
}

export function clearSession(): void {
  ["auth_ok", "login_id", "auth_token", "auth_exp"].forEach((k) =>
    sessionStorage.removeItem(k)
  );
}

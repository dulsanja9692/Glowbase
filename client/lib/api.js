const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("glowbase_token");
}

export function setToken(token) {
  if (typeof window !== "undefined") localStorage.setItem("glowbase_token", token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("glowbase_token");
}

export async function api(path, { method = "GET", body, isFormData = false } = {}) {
  const token = getToken();
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

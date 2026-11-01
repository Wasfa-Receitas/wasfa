const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const tokenKey = "wasfa:accessToken";
export const session = {
  get: () => sessionStorage.getItem(tokenKey),
  set: (token) => sessionStorage.setItem(tokenKey, token),
  clear: () => sessionStorage.removeItem(tokenKey),
};
export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
export async function api(path, { body, authenticated = false, signal, ...options } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authenticated && session.get()) headers.Authorization = `Bearer ${session.get()}`;
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers, signal, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Não foi possível conectar ao servidor. Tente novamente.", 0);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (authenticated && response.status === 401) {
      session.clear();
      window.dispatchEvent(new Event("wasfa:session-expired"));
    }
    const message = Array.isArray(data?.message) ? data.message.join(" ") : data?.message;
    throw new ApiError(message || "Não foi possível concluir a solicitação.", response.status);
  }
  return data;
}
export const authApi = {
  login: (body) => api("/auth/login", { method: "POST", body }),
  register: (body) => api("/auth/register", { method: "POST", body }),
  me: (signal) => api("/auth/me", { authenticated: true, signal }),
};
export const recipesApi = {
  list: (filters, signal) => api(`/recipes?${new URLSearchParams(filters)}`, { signal }),
  detail: (id, signal) => api(`/recipes/${encodeURIComponent(id)}`, { signal }),
};

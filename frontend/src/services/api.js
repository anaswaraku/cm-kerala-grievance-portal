const API_URL = import.meta.env.VITE_API_URL;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

// GET request
export const getApiStatus = async () => {
  return request("/");
};

export const registerCitizen = (details) => request("/api/auth/register", { method: "POST", body: JSON.stringify(details) });
export const login = (credentials) => request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const getCurrentUser = (token) => request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
export const getRoleDashboard = (role, token) => request({
  citizen: "/api/auth/dashboard/citizen",
  cmo_admin: "/api/auth/dashboard/cmo",
  department_officer: "/api/auth/dashboard/officer",
}[role], { headers: { Authorization: `Bearer ${token}` } });

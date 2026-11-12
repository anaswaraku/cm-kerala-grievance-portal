const API_URL = import.meta.env.VITE_API_URL;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
};

export const registerCitizen = (details) => request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify(details),
});

export const login = (credentials) => request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});

export const getCurrentUser = (token) => request("/api/auth/me", {
  headers: { Authorization: `Bearer ${token}` },
});

export const logoutRequest = (token) => request("/api/auth/logout", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});


export const getDepartments = () => request("/api/departments");

const dashboardPath = {
  citizen: "/api/auth/dashboard/citizen",
  cmo_admin: "/api/auth/dashboard/cmo",
  department_officer: "/api/auth/dashboard/officer",
};

export const getRoleDashboard = (role, token) => request(dashboardPath[role], {
  headers: { Authorization: `Bearer ${token}` },
});

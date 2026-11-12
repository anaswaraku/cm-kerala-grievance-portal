const API_URL = import.meta.env.VITE_API_URL;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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

// Fetch districts for dropdown
export const getDistricts = () => request("/api/grievances/districts");

// Submit grievance
export const submitGrievance = (data, token) =>
  request("/api/grievances", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

const dashboardPath = {
  citizen: "/api/auth/dashboard/citizen",
  cmo_admin: "/api/auth/dashboard/cmo",
  department_officer: "/api/auth/dashboard/officer",
};

export const getRoleDashboard = (role, token) => request(dashboardPath[role], {
  headers: { Authorization: `Bearer ${token}` },
});

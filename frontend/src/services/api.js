const API_URL = import.meta.env.API_URL;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
};

const uploadRequest = async (path, formData, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(new Error(data.message || "Upload failed"), {
      status: response.status,
    });
  return data;
};

// --- Auth ---

export const registerCitizen = (details) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });

export const login = (credentials) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getCurrentUser = (token) =>
  request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const logoutRequest = (token) =>
  request("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- Role Dashboard ---

const dashboardPath = {
  citizen: "/api/auth/dashboard/citizen",
  cmo_admin: "/api/auth/dashboard/cmo",
  department_officer: "/api/auth/dashboard/officer",
};

export const getRoleDashboard = (role, token) =>
  request(dashboardPath[role], {
    headers: { Authorization: `Bearer ${token}` },
  });

// --- Departments ---

export const getDepartments = () => request("/api/departments");

// --- Districts ---

export const getDistricts = () => request("/api/grievances/districts");

// --- Grievances ---

export const submitGrievance = (data, token) =>
  request("/api/grievances", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const analyzeGrievance = (data, token) =>
  request("/api/grievances/analyze", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const getGrievances = (token, params = {}) => {
  const qs = new URLSearchParams();
  if (params.district) qs.set("district", params.district);
  if (params.status) qs.set("status", params.status);
  if (params.category) qs.set("category", params.category);
  if (params.priority) qs.set("priority", params.priority);
  const query = qs.toString();
  return request(`/api/grievances${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getGrievanceCounts = (token) =>
  request("/api/grievances/counts", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getGrievanceDetail = (id, token) =>
  request(`/api/grievances/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyCitizenGrievances = (token) =>
  request("/api/grievances/my", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const changeGrievanceStatus = (id, body, token) =>
  request(`/api/grievances/${id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

export const assignDepartment = (id, body, token) =>
  request(`/api/grievances/${id}/assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

export const trackGrievance = (ref) => request(`/api/grievances/track/${ref}`);

export const uploadAttachment = (id, file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  return uploadRequest(`/api/grievances/${id}/attachments`, formData, token);
};

export const submitFeedback = (id, body, token) =>
  request(`/api/grievances/${id}/feedback`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

// --- Reports ---

export const submitReport = (body, token) =>
  request("/api/reports", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

export const reviewReport = (id, body, token) =>
  request(`/api/reports/${id}/review`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

// --- Public ---

export const getPublicStats = () => request("/api/stats");

export const submitEnquiry = (body) =>
  request("/api/enquiries", {
    method: "POST",
    body: JSON.stringify(body),
  });

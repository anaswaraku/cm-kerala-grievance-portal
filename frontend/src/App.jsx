import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import EntryPage from "./pages/EntryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleDashboard from "./pages/RoleDashboard";
import UnauthorizedPage from "./pages/UnauthorizedPage";

import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <Routes>
<Route path="/" element={<HomePage />} />
<Route path="/access" element={<EntryPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/login/:entry" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/citizen/dashboard" element={<ProtectedRoute allow="citizen"><RoleDashboard role="citizen" /></ProtectedRoute>} />
      <Route path="/cmo/dashboard" element={<ProtectedRoute allow="cmo_admin"><RoleDashboard role="cmo_admin" /></ProtectedRoute>} />
      <Route path="/officer/dashboard" element={<ProtectedRoute allow="department_officer"><RoleDashboard role="department_officer" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

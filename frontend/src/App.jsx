import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import EntryPage from "./pages/EntryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleDashboard from "./pages/RoleDashboard";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import TrackPage from "./pages/TrackPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/track/:ref" element={<TrackPage />} />
      <Route path="/access" element={<EntryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/:entry" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/departments" element={<DepartmentsPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute allow="citizen">
            <RoleDashboard role="citizen" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cmo/dashboard"
        element={
          <ProtectedRoute allow="cmo_admin">
            <RoleDashboard role="cmo_admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute allow="department_officer">
            <RoleDashboard role="department_officer" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

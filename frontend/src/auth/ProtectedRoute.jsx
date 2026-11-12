import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ allow, children }) {
  const { session, ready } = useAuth();

  if (!ready) return <p className="status-line">Checking your session…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== allow) return <Navigate to="/unauthorized" replace />;
  return children;
}

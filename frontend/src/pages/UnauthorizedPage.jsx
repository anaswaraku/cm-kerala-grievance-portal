import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_HOME, ROLE_TITLE } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";

export default function UnauthorizedPage() {
  const { session, ready, signOut } = useAuth();

  if (!ready) return <p className="status-line">Checking your session…</p>;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <PortalFrame action={<button className="text-button" type="button" onClick={signOut}>Log out</button>}>
      <main className="auth-layout">
        <section className="auth-card">
          <p className="eyebrow">Unauthorized</p>
          <h1>This area is not available for your account.</h1>
          <p>You are signed in as {session.user.name}. Your account opens the {ROLE_TITLE[session.user.role].toLowerCase()}.</p>
          <Link className="button primary" to={ROLE_HOME[session.user.role]}>Go to your dashboard</Link>
        </section>
      </main>
    </PortalFrame>
  );
}

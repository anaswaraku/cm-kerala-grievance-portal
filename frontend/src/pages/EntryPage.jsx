import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_HOME } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";

export default function EntryPage() {
  const { session, ready } = useAuth();

  if (!ready) return <p className="status-line">Checking your session…</p>;
  if (session) return <Navigate to={ROLE_HOME[session.user.role]} replace />;

  return (
    <PortalFrame>
      <main className="entry-layout">
        <section className="entry-intro">
          <p className="eyebrow">Public grievance redressal</p>
          <h1>Choose how you are signing in.</h1>
          <p>Citizens can register and track grievances. CMO administrators and department officers sign in with the accounts assigned to them.</p>
        </section>
        <section className="entry-grid" aria-label="Sign-in options">
          <article className="entry-card">
            <h2>Citizen Portal</h2>
            <p>Create an account or return to grievances you have already submitted.</p>
            <div className="entry-actions">
              <Link className="button primary" to="/register">Register</Link>
              <Link className="button" to="/login/citizen">Sign in</Link>
            </div>
          </article>
          <article className="entry-card">
            <h2>CMO Administrator</h2>
            <p>Review grievances, forward them to departments, and monitor action.</p>
            <div className="entry-actions">
              <Link className="button primary" to="/login/cmo">Sign in</Link>
            </div>
          </article>
          <article className="entry-card">
            <h2>Department Officer</h2>
            <p>Work on grievances the Chief Minister's Office has forwarded to your department.</p>
            <div className="entry-actions">
              <Link className="button primary" to="/login/officer">Sign in</Link>
            </div>
          </article>
        </section>
      </main>
    </PortalFrame>
  );
}

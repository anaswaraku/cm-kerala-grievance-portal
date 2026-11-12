import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_HOME } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";

export default function EntryPage() {
  const { session, ready } = useAuth();
  const [activeLogin, setActiveLogin] = useState("citizen");

  if (!ready) return <p className="status-line">Checking your session…</p>;

  if (session) return <Navigate to={ROLE_HOME[session.user.role]} replace />;

  return (
    <PortalFrame>
      <main className="entry-layout">
        <section className="entry-intro">
          <p className="eyebrow">Public grievance redressal</p>
          <h1>Grievance Redressal Portal</h1>
          <p>
            Submit your grievances and track their progress through the official
            portal.
          </p>
        </section>

        <section className="login-container" aria-label="Login options">
          {/* Login Selection Buttons */}
          <div className="login-tabs">
            <button
              className={activeLogin === "citizen" ? "active" : ""}
              onClick={() => setActiveLogin("citizen")}
            >
              Citizen Login
            </button>

            <button
              className={activeLogin === "cmo" ? "active" : ""}
              onClick={() => setActiveLogin("cmo")}
            >
              Admin Login
            </button>

            <button
              className={activeLogin === "officer" ? "active" : ""}
              onClick={() => setActiveLogin("officer")}
            >
              Department Login
            </button>
          </div>

          {/* Citizen Login - Default */}
          {activeLogin === "citizen" && (
            <article className="entry-card">
              <h2>Citizen Portal</h2>
              <p>
                Create an account or return to grievances you have already
                submitted.
              </p>

              <div className="entry-actions">
                <Link className="button primary" to="/register">
                  Register
                </Link>

                <Link className="button" to="/login/citizen">
                  Sign in
                </Link>
              </div>
            </article>
          )}

          {/* CMO Admin Login */}
          {activeLogin === "cmo" && (
            <article className="entry-card">
              <h2>CMO Administrator</h2>
              <p>
                Review grievances, forward them to departments, and monitor
                action.
              </p>

              <div className="entry-actions">
                <Link className="button primary" to="/login/cmo">
                  Admin Sign in
                </Link>
              </div>
            </article>
          )}

          {/* Department Officer Login */}
          {activeLogin === "officer" && (
            <article className="entry-card">
              <h2>Department Officer</h2>
              <p>
                Work on grievances the Chief Minister's Office has forwarded to
                your department.
              </p>

              <div className="entry-actions">
                <Link className="button primary" to="/login/officer">
                  Officer Sign in
                </Link>
              </div>
            </article>
          )}
        </section>
      </main>
    </PortalFrame>
  );
}

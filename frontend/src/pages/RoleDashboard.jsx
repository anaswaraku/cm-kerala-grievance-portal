import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_TITLE } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";
import { getRoleDashboard } from "../services/api";

export default function RoleDashboard({ role }) {
  const { session, signOut } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getRoleDashboard(role, session.token)
      .then((data) => {
        if (active) setMessage(data.message);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) signOut();
        else setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [role, session.token, signOut]);

  return (
    <PortalFrame action={<button className="text-button" type="button" onClick={signOut}>Log out</button>}>
      <main className="dashboard-layout">
        <section className="dashboard-card">
          <p className="eyebrow">Signed in as {session.user.role.replaceAll("_", " ")}</p>
          <h1>{ROLE_TITLE[role]}</h1>
          <p>Welcome, {session.user.name}.</p>
          {message && <p>{message}</p>}
          {error && <p className="error" role="alert">{error}</p>}
        </section>
      </main>
    </PortalFrame>
  );
}

import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ENTRIES, ROLE_HOME } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";

export default function LoginPage() {
  const { entry } = useParams();
  const selected = ENTRIES[entry] || null;
  const { session, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return <p className="status-line">Checking your session…</p>;
  if (session) return <Navigate to={ROLE_HOME[session.user.role]} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await signIn({ email, password, expectedRole: selected?.role });
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PortalFrame>
      <main className="auth-layout">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">Secure access</p>
          <h1>{selected?.title || "Sign in"}</h1>
          <p className="form-note">
            {selected
              ? "Your account role comes from the database. This page only sets the heading."
              : "Citizens, CMO administrators, and department officers use this sign-in."}
          </p>
          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength="8" required />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="button primary" type="submit" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button>
          <p className="form-links">
            <Link to="/">All sign-in options</Link>
            {selected?.role === "citizen" && <Link to="/register">Create a citizen account</Link>}
          </p>
        </form>
      </main>
    </PortalFrame>
  );
}

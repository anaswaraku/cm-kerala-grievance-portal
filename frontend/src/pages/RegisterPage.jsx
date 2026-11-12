import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_HOME } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";

const emptyForm = { name: "", email: "", mobile: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const { session, ready, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return <p className="status-line">Checking your session…</p>;
  if (session) return <Navigate to={ROLE_HOME[session.user.role]} replace />;

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
      });
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
          <p className="eyebrow">Citizen registration</p>
          <h1>Create a citizen account</h1>
          <p className="form-note">Registration is available for citizens only. Staff accounts are assigned separately.</p>
          <label>
            Full name
            <input name="name" value={form.name} onChange={update} autoComplete="name" required />
          </label>
          <label>
            Email address
            <input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required />
          </label>
          <label>
            Mobile number
            <input name="mobile" value={form.mobile} onChange={update} inputMode="numeric" autoComplete="tel" pattern="[0-9]{10,15}" required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={update} autoComplete="new-password" minLength="8" required />
          </label>
          <label>
            Confirm password
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" minLength="8" required />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="button primary" type="submit" disabled={busy}>{busy ? "Please wait…" : "Create account"}</button>
          <p className="form-links">
            <Link to="/login/citizen">Already registered? Sign in</Link>
          </p>
        </form>
      </main>
    </PortalFrame>
  );
}

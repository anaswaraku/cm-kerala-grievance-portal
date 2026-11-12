import { useEffect, useState } from "react";
import { getCurrentUser, getRoleDashboard, login, registerCitizen } from "./services/api";
import "./App.css";

const emptyForm = { name: "", email: "", mobile: "", password: "", confirmPassword: "" };
const roleTitles = { citizen: "Citizen dashboard", cmo_admin: "CMO administrator dashboard", department_officer: "Department officer dashboard" };

function App() {
  const [mode, setMode] = useState("login");
  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem("cmGrievanceSession")) || null; } catch { return null; } });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dashboardMessage, setDashboardMessage] = useState("");
  const token = session?.token;
  const userRole = session?.user?.role;

  const saveSession = (nextSession) => { localStorage.setItem("cmGrievanceSession", JSON.stringify(nextSession)); setSession(nextSession); };
  const logout = () => { localStorage.removeItem("cmGrievanceSession"); setSession(null); setDashboardMessage(""); };

  useEffect(() => {
    if (!token) return;
    getCurrentUser(token)
      .then(({ user }) => { const nextSession = { token, user }; localStorage.setItem("cmGrievanceSession", JSON.stringify(nextSession)); setSession(nextSession); })
      .catch(logout);
  }, [token]);
  useEffect(() => {
    if (!token || !userRole) return;
    getRoleDashboard(userRole, token).then((data) => setDashboardMessage(data.message)).catch((requestError) => setDashboardMessage(requestError.message));
  }, [token, userRole]);

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (mode === "register" && form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setBusy(true);
    try {
      const result = mode === "register" ? await registerCitizen({ name: form.name, email: form.email, mobile: form.mobile, password: form.password }) : await login({ email: form.email, password: form.password });
      saveSession({ token: result.token, user: result.user }); setForm(emptyForm);
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };

  if (session) {
    const role = session.user.role;
    return <main className="portal-shell"><header className="portal-header"><span>Kerala CM Grievance Portal</span><button className="text-button" onClick={logout}>Log out</button></header><section className="dashboard-card"><p className="eyebrow">Signed in as {role.replace("_", " ")}</p><h1>{roleTitles[role]}</h1><p>Welcome, {session.user.name}. {dashboardMessage}</p><p className="next-step">{role === "citizen" ? "You can now submit and track your grievances." : role === "cmo_admin" ? "You can review, assign, and monitor grievances." : "You can work on grievances assigned to your department."}</p></section></main>;
  }

  return <main className="portal-shell"><header className="portal-header"><span>Kerala CM Grievance Portal</span><span className="secure-label">Secure access</span></header><section className="auth-layout"><div className="intro"><p className="eyebrow">Public grievance redressal</p><h1>A clearer route to resolution.</h1><p>Citizens can create an account to submit and track grievances. CMO administrators and department officers sign in with their assigned accounts.</p></div><div className="auth-card"><div className="tabs"><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Citizen registration</button></div><h2>{mode === "register" ? "Create a citizen account" : "Welcome back"}</h2><p className="form-note">{mode === "register" ? "Registration is available for citizens only." : "Citizens, CMO administrators, and department officers use this sign-in."}</p><form onSubmit={submit}>{mode === "register" && <><label>Full name<input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></label><label>Mobile number<input name="mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} inputMode="numeric" autoComplete="tel" required /></label></>}<label>Email address<input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></label><label>Password<input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength="8" required /></label>{mode === "register" && <label>Confirm password<input type="password" name="confirmPassword" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" minLength="8" required /></label>}{error && <p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button></form></div></section></main>;
}

export default App;

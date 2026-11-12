import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function PortalFrame({ action, children }) {
  const { session } = useAuth();
  return (
    <div className="portal-shell">
      <p className="prototype-banner">Recruitment prototype — Not an official Government of Kerala service</p>
      <header className="portal-header">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "inherit" }}>
          <img src="/src/assets/logo.png" alt="Kerala emblem" height="40" />
          <span style={{ fontWeight: 700 }}>Kerala CM Grievance Portal</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {action}
        </div>
      </header>
      <nav style={{ background: "#f7faf6", borderBottom: "1px solid #d5e0d6", padding: "0.4rem 8vw", display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem" }}>
        <Link to="/" style={{ color: "#1c2b24", textDecoration: "none", fontWeight: 500 }}>Home</Link>
        <Link to="/about" style={{ color: "#1c2b24", textDecoration: "none", fontWeight: 500 }}>About</Link>
        <Link to="/how-it-works" style={{ color: "#1c2b24", textDecoration: "none", fontWeight: 500 }}>How It Works</Link>
        <Link to="/departments" style={{ color: "#1c2b24", textDecoration: "none", fontWeight: 500 }}>Departments</Link>
        <Link to="/contact" style={{ color: "#1c2b24", textDecoration: "none", fontWeight: 500 }}>Contact</Link>
        <Link to="/faq" style={{ color: "#1c2b24", textDecoration: "none", fontWeight: 500 }}>FAQ</Link>
        <Link to="/track" style={{ color: "#0d5c42", textDecoration: "none", fontWeight: 600 }}>Track Grievance</Link>
        {!session && (
          <Link to="/access" style={{ color: "#0d5c42", textDecoration: "none", fontWeight: 600 }}>Submit Grievance</Link>
        )}
      </nav>
      {children}
      <footer style={{ background: "#1c2b24", color: "#f4efe4", textAlign: "center", padding: "1.5rem", fontSize: "0.85rem", marginTop: "auto" }}>
        <p style={{ margin: 0 }}>© 2026 CM Kerala Grievance Portal — Recruitment Prototype. Not an official Government of Kerala service.</p>
      </footer>
    </div>
  );
}

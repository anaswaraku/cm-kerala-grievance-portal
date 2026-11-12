import { Link } from "react-router-dom";

export default function PortalFrame({ children, action }) {
  return (
    <div className="portal-shell">
      <p className="prototype-banner">Recruitment prototype. Not an official Government of Kerala service.</p>
      <header className="portal-header">
        <Link to="/">Kerala CM Grievance Portal</Link>
        {action}
      </header>
      {children}
    </div>
  );
}

import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import logo from "../assets/logo.png";

export default function HomePage() {
  return (
    <main className="entry-layout">
      <header className="entry-header">
        <Link to="/" className="logo">
          <img src={logo} alt="Portal Logo" />
        </Link>

        <nav className="header-links">
          <Link to="/register">Register</Link>
          <Link to="/access">Sign in</Link>
          <Link to="/track">Track</Link>
        </nav>
      </header>

      <section className="about-section">
        <h1>"നമസ്കാരം"</h1>
        <h2>Welcome to the Kerala Grievance Portal</h2>
        <p>The Kerala Grievance Portal is a platform that allows citizens to</p>
        <p></p>
      </section>
    <div className="footer">
      <section
        className="footer-container"
      >
        <Link to="/departments">Departments</Link>
        <Link to="/contact">contact</Link>
        <Link to="/faq">FAQ</Link>
      </section></div>
    </main>
  );
}

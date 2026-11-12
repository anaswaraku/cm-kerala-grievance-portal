import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PortalFrame from "../components/PortalFrame";
import { getPublicStats } from "../services/api";
import "../styles/HomePage.css";

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    getPublicStats()
      .then((data) => setStats(data.stats || data))
      .catch(() => setStatsError(true));
  }, []);

  const statItems = [
    { key: "total", label: "Total Grievances" },
    { key: "resolved", label: "Resolved" },
    { key: "pending", label: "Pending" },
    { key: "districts_served", label: "Districts Served" },
  ];

  const steps = [
    {
      num: 1,
      title: "Submit",
      desc: "Register as a citizen and submit your grievance with supporting details.",
    },
    {
      num: 2,
      title: "CMO Reviews",
      desc: "The Chief Minister's Office reviews and assigns your grievance to the relevant department.",
    },
    {
      num: 3,
      title: "Department Action",
      desc: "The assigned department officer investigates and takes appropriate action.",
    },
    {
      num: 4,
      title: "Resolution",
      desc: "You are notified of the outcome and can provide feedback on the resolution.",
    },
  ];

  return (
    <PortalFrame>
      {/* Hero */}
      <section className="home-hero">
        <h1>നിങ്ങളുടെ ശബ്ദം, നാടിന്റെ പുരോഗതി</h1>
        <p></p>
        <div className="home-hero-actions">
          <Link to="/access" className="button primary">
            Submit a Grievance
          </Link>
          <Link to="/track" className="button">
            Track Your Grievance
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <h2>Portal at a Glance</h2>
        {statsError ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Statistics unavailable at this time.
          </p>
        ) : (
          <div className="stats-grid">
            {statItems.map(({ key, label }) => (
              <div className="stat-card" key={key}>
                <div className="stat-number">
                  {stats ? (stats[key]?.toLocaleString() ?? "—") : "…"}
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works preview */}
      <section className="steps-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div className="step-card" key={s.num}>
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/how-it-works" className="button">
            See Full Guide
          </Link>
        </div>
      </section>

      {/* About snippet */}
      <section className="about-section">
        <h2 style={{ marginBottom: "1rem", color: "#0d5c42" }}>
          About the Portal
        </h2>
        <p
          style={{ color: "#4b6254", lineHeight: 1.8, marginBottom: "1.5rem" }}
        >
          The CM Kerala Grievance Portal is a digital platform connecting
          citizens directly with the Chief Minister's Office. Grievances are
          routed to the relevant state departments, tracked end-to-end, and
          resolved with full transparency. Built as a recruitment prototype for
          evaluation purposes.
        </p>
        <Link to="/about" className="button">
          Learn More
        </Link>
      </section>
    </PortalFrame>
  );
}

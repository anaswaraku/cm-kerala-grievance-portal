import PortalFrame from "../components/PortalFrame";

export default function AboutPage() {
  return (
    <PortalFrame>
      <div className="dashboard-layout" style={{ maxWidth: "54rem", margin: "0 auto", padding: "2.5rem 8vw" }}>
        {/* Disclaimer banner */}
        <div
          className="dashboard-card"
          style={{
            background: "#fffbeb",
            border: "1px solid #c4a35a",
            borderRadius: "12px",
            padding: "1rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          <strong style={{ color: "#92400e" }}>⚠ Prototype Notice:</strong>{" "}
          <span style={{ color: "#78350f" }}>
            This is a recruitment prototype built for evaluation purposes. It is{" "}
            <strong>not</strong> an official Government of Kerala service. No
            real grievances are processed.
          </span>
        </div>

        <h1 style={{ color: "#0d5c42", marginBottom: "0.25rem" }}>
          About the Kerala CM Grievance Portal
        </h1>
        <p style={{ color: "#4d5d53", fontSize: "1rem", marginBottom: "2.5rem" }}>
          A digital bridge between citizens and the Chief Minister's Office.
        </p>

        {/* Purpose */}
        <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#0d5c42", marginTop: 0 }}>Our Purpose</h2>
          <p style={{ color: "#374151", lineHeight: 1.8 }}>
            The CM Kerala Grievance Portal was designed to give every citizen
            of Kerala a direct, transparent channel to raise concerns with the
            Chief Minister's Office. We believe accountability starts with
            accessibility — anyone should be able to submit a grievance, track
            its progress, and receive a resolution without navigating complex
            bureaucratic hurdles.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.8 }}>
            The portal digitises the end-to-end lifecycle of a grievance: from
            initial submission, through departmental assignment and
            investigation, to final resolution and citizen feedback — all
            logged and visible to the citizen throughout.
          </p>
        </div>

        {/* How the Portal Works */}
        <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#0d5c42", marginTop: 0 }}>How the Portal Works</h2>
          <ol style={{ color: "#374151", lineHeight: 2, paddingLeft: "1.25rem" }}>
            <li>
              <strong>Citizens</strong> register on the portal and submit
              grievances with supporting details and optional attachments.
            </li>
            <li>
              <strong>CMO Administrators</strong> review incoming submissions,
              prioritise them, and assign each to the appropriate government
              department.
            </li>
            <li>
              <strong>Department Officers</strong> investigate the grievance,
              take necessary action, and submit an Action Taken Report.
            </li>
            <li>
              <strong>CMO Administrators</strong> review the report and either
              accept it (marking the grievance resolved) or send it back for
              further action.
            </li>
            <li>
              <strong>Citizens</strong> are notified at every stage and can
              provide feedback once their grievance is resolved.
            </li>
          </ol>
        </div>

        {/* Who Can Use It */}
        <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#0d5c42", marginTop: 0 }}>Who Can Use It</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "1rem" }}>
            {[
              { role: "Citizens", desc: "Any resident of Kerala can register and submit grievances related to government services." },
              { role: "CMO Administrators", desc: "Staff at the Chief Minister's Office who triage, assign, and resolve grievances." },
              { role: "Department Officers", desc: "Government officials in various departments who investigate and report on assigned grievances." },
            ].map(({ role, desc }) => (
              <div
                key={role}
                style={{
                  background: "#f7faf6",
                  borderRadius: "10px",
                  padding: "1rem",
                  border: "1px solid #d5e0d6",
                }}
              >
                <strong style={{ color: "#0d5c42" }}>{role}</strong>
                <p style={{ color: "#4d5d53", fontSize: "0.9rem", margin: "0.5rem 0 0" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="dashboard-card">
          <h2 style={{ color: "#0d5c42", marginTop: 0 }}>Disclaimer</h2>
          <p style={{ color: "#374151", lineHeight: 1.8 }}>
            This portal is a <strong>recruitment prototype</strong> created
            solely for technical evaluation and demonstration purposes. It is
            not affiliated with, endorsed by, or operated by the Government of
            Kerala. Data entered is not real and will not be acted upon by any
            government authority. All branding, names, and references to Kerala
            government entities are used solely to simulate a realistic
            government service environment.
          </p>
        </div>
      </div>
    </PortalFrame>
  );
}

import { Link } from "react-router-dom";
import PortalFrame from "../components/PortalFrame";

const STEPS = [
  {
    num: 1,
    title: "Register as a Citizen",
    desc: "Create a free account on the portal by providing your name, email address, mobile number, and a secure password. Registration is required to submit grievances and track their status.",
  },
  {
    num: 2,
    title: "Submit a Grievance",
    desc: "Once logged in, navigate to your dashboard and click \"Submit Grievance\". Fill in the category, district, subject, and a detailed description of your issue. You may optionally attach supporting documents or images. On successful submission, you will receive a unique reference number.",
  },
  {
    num: 3,
    title: "Track Your Grievance",
    desc: "Use your reference number on the Track Grievance page to check the current status at any time — even without logging in. You can also view the full history of your grievance from your citizen dashboard.",
  },
  {
    num: 4,
    title: "CMO Reviews & Assigns to Department",
    desc: "A CMO Administrator reviews your submission, verifies details, sets priority, and forwards it to the appropriate government department and officer for investigation.",
  },
  {
    num: 5,
    title: "Officer Investigates & Reports",
    desc: "The assigned department officer carries out an investigation, takes the necessary action, and submits a detailed Action Taken Report to the CMO describing what was done.",
  },
  {
    num: 6,
    title: "CMO Reviews Report & Resolves",
    desc: "The CMO Administrator reviews the officer's report. If satisfactory, the grievance is marked Resolved. If not, it is sent back to the officer for further action.",
  },
  {
    num: 7,
    title: "Provide Feedback",
    desc: "Once your grievance is resolved, you will be invited to rate your experience (1–5 stars) and leave optional feedback. Your feedback helps improve the system and holds departments accountable.",
  },
];

export default function HowItWorksPage() {
  return (
    <PortalFrame>
      <div style={{ maxWidth: "54rem", margin: "0 auto", padding: "2.5rem 8vw" }}>
        <h1 style={{ color: "#0d5c42", marginBottom: "0.25rem" }}>
          How It Works
        </h1>
        <p style={{ color: "#4d5d53", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          A step-by-step guide to submitting and resolving a grievance through
          the Kerala CM Grievance Portal.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="dashboard-card"
              style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "50%",
                  background: "#0d5c42",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  boxShadow: "0 2px 8px rgba(13,92,66,0.25)",
                }}
              >
                {step.num}
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.5rem", color: "#1c2b24" }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, color: "#4b6254", lineHeight: 1.75, fontSize: "0.95rem" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/access" className="button primary">
            Submit a Grievance
          </Link>
          <Link to="/track" className="button">
            Track a Grievance
          </Link>
          <Link to="/faq" className="button">
            Read the FAQ
          </Link>
        </div>
      </div>
    </PortalFrame>
  );
}

import { useState } from "react";
import PortalFrame from "../components/PortalFrame";

const FAQS = [
  {
    q: "Who can submit a grievance?",
    a: "Any resident of Kerala can submit a grievance. You need to register a free citizen account on the portal using your name, email address, and mobile number.",
  },
  {
    q: "What types of grievances can be submitted?",
    a: "You can submit grievances related to any government service or department in Kerala — including infrastructure, public health, education, revenue, water supply, electricity, transport, agriculture, and more.",
  },
  {
    q: "How do I track my grievance?",
    a: "You can track your grievance using the reference number provided at submission. Visit the Track Grievance page, enter your reference number, and the current status and history will be displayed — no login required.",
  },
  {
    q: "How long does the process take?",
    a: "Resolution time depends on the nature and complexity of the grievance and the department involved. Simple administrative issues may be resolved within a few days, while complex ones requiring field investigation may take several weeks. You can monitor progress via the tracking page at any time.",
  },
  {
    q: "What is the reference number?",
    a: "The reference number is a unique identifier assigned to your grievance at the time of submission. It is displayed on-screen and can be used to track your grievance without logging in. Keep it safe — it is your primary way to follow up.",
  },
  {
    q: "Can I submit attachments?",
    a: "Yes. When submitting a grievance, you may attach supporting documents, photographs, or other files (up to the allowed size limit). Attachments help the reviewing officer understand your issue more clearly.",
  },
  {
    q: "What happens after I submit?",
    a: "After submission, your grievance is reviewed by a CMO Administrator who verifies the details, sets a priority level, and assigns it to the relevant government department and officer. You can track this progress in real time.",
  },
  {
    q: "Who reviews my grievance?",
    a: "Initially, a CMO Administrator at the Chief Minister's Office reviews and routes your grievance. It is then investigated by a Department Officer from the relevant ministry or department, who submits an Action Taken Report. The CMO Admin makes the final resolution decision.",
  },
  {
    q: "What if I am not satisfied with the resolution?",
    a: "If you are not satisfied with the resolution, you can leave feedback indicating your dissatisfaction. In a production system, there would be an escalation or appeal mechanism. Currently, please use the Contact Us page to reach the portal administrators.",
  },
  {
    q: "Is this an official Government of Kerala service?",
    a: "No. This portal is a recruitment prototype built solely for technical evaluation purposes. It is not affiliated with, endorsed by, or operated by the Government of Kerala. No real grievances are processed, and all data entered here is not acted upon by any government authority.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <PortalFrame>
      <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "2.5rem 8vw" }}>
        <h1 style={{ color: "#0d5c42", marginBottom: "0.25rem" }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: "#4d5d53", marginBottom: "2rem", lineHeight: 1.7 }}>
          Find answers to common questions about the Kerala CM Grievance
          Portal below.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  border: "1px solid",
                  borderColor: isOpen ? "#0d5c42" : "#d5e0d6",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "border-color 200ms",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: isOpen ? "#f0f9f4" : "#fbfcfb",
                    border: "none",
                    padding: "1rem 1.25rem",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: isOpen ? "#0d5c42" : "#1c2b24",
                    transition: "background 200ms, color 200ms",
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: "1.1rem",
                      color: "#0d5c42",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 200ms",
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 1.25rem 1rem",
                      background: "#f0f9f4",
                      color: "#374151",
                      lineHeight: 1.75,
                      fontSize: "0.93rem",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.25rem 1.5rem",
            background: "#fffbeb",
            border: "1px solid #c4a35a",
            borderRadius: "12px",
            color: "#78350f",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          <strong>Still have questions?</strong> Visit our{" "}
          <a href="/contact" style={{ color: "#0d5c42" }}>
            Contact page
          </a>{" "}
          and we will be happy to help.
        </div>
      </div>
    </PortalFrame>
  );
}

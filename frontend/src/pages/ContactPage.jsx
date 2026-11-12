import { useState } from "react";
import PortalFrame from "../components/PortalFrame";
import { submitEnquiry } from "../services/api";

const INITIAL = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await submitEnquiry({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setError(err?.message || "Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalFrame>
      <div className="auth-layout" style={{ padding: "3rem 8vw" }}>
        <div
          className="auth-card"
          style={{ maxWidth: "38rem", width: "100%", margin: "0 auto" }}
        >
          <h1 style={{ color: "#0d5c42", marginTop: 0, marginBottom: "0.25rem" }}>
            Contact Us
          </h1>
          <p style={{ color: "#4d5d53", marginBottom: "1.75rem", fontSize: "0.95rem" }}>
            Have a question or need assistance? Fill out the form below and we
            will get back to you as soon as possible.
          </p>

          {success ? (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "10px",
                padding: "1.25rem 1.5rem",
                color: "#166534",
                lineHeight: 1.7,
              }}
            >
              <strong>✓ Message received!</strong>
              <p style={{ margin: "0.5rem 0 0" }}>
                Your message has been received. We will respond shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  disabled={loading}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your enquiry"
                  disabled={loading}
                  required
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your enquiry in detail…"
                  rows={5}
                  disabled={loading}
                  required
                  style={{ width: "100%", resize: "vertical", fontFamily: "inherit", fontSize: "inherit" }}
                />
              </div>

              {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}

              <button
                type="submit"
                className="button primary"
                disabled={loading}
                style={{ width: "100%" }}
              >
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PortalFrame>
  );
}

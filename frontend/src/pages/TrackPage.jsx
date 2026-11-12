import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PortalFrame from "../components/PortalFrame";
import { trackGrievance } from "../services/api";

export default function TrackPage() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(ref || "");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ref) handleSearch(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const handleSearch = async (refNum = input) => {
    if (!refNum.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await trackGrievance(refNum.trim().toUpperCase());
      setResult(data.grievance);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || "Grievance not found");
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLOR = {
    Submitted: "#6b7280",
    "Under Review": "#2563eb",
    "In Progress": "#d97706",
    Resolved: "#16a34a",
    Reopened: "#dc2626",
  };

  return (
    <PortalFrame>
      <main
        className="auth-layout"
        style={{ justifyItems: "stretch", padding: "2.5rem 8vw" }}
      >
        <section style={{ maxWidth: "42rem", margin: "0 auto", width: "100%" }}>
          <p className="eyebrow">Public Grievance Tracking</p>
          <h1>Track Your Grievance</h1>
          <p className="form-note">
            Enter your reference number to check the current status of your
            grievance.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/track/${input.trim().toUpperCase()}`);
            }}
            style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. KL-123456-456"
              style={{ flex: "1 1 16rem" }}
            />
            <button
              className="button primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {error && (
            <p className="error" role="alert" style={{ marginTop: "1rem" }}>
              {error}
            </p>
          )}

          {result && (
            <div className="dashboard-card" style={{ marginTop: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <p className="eyebrow">Reference Number</p>
                  <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                    {result.reference_number}
                  </h2>
                </div>
                <span
                  style={{
                    background: STATUS_COLOR[result.status] || "#6b7280",
                    color: "white",
                    borderRadius: "999px",
                    padding: "0.3rem 0.9rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {result.status}
                </span>
              </div>

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "0.4rem 1rem",
                  marginTop: "1rem",
                }}
              >
                <dt style={{ fontWeight: 600 }}>District</dt>
                <dd style={{ margin: 0 }}>{result.district}</dd>
                <dt style={{ fontWeight: 600 }}>Category</dt>
                <dd style={{ margin: 0 }}>{result.category}</dd>
                <dt style={{ fontWeight: 600 }}>Subject</dt>
                <dd style={{ margin: 0 }}>{result.subject}</dd>
                {result.department_name && (
                  <>
                    <dt style={{ fontWeight: 600 }}>Department</dt>
                    <dd style={{ margin: 0 }}>{result.department_name}</dd>
                  </>
                )}
                <dt style={{ fontWeight: 600 }}>Submitted</dt>
                <dd style={{ margin: 0 }}>
                  {new Date(result.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
                {result.resolved_at && (
                  <>
                    <dt style={{ fontWeight: 600 }}>Resolved</dt>
                    <dd style={{ margin: 0 }}>
                      {new Date(result.resolved_at).toLocaleDateString(
                        "en-IN",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </dd>
                  </>
                )}
              </dl>

              {history.length > 0 && (
                <>
                  <h3 style={{ marginTop: "1.5rem" }}>Status History</h3>
                  <ol
                    style={{
                      padding: 0,
                      listStyle: "none",
                      display: "grid",
                      gap: "0.75rem",
                    }}
                  >
                    {history.map((h, i) => (
                      <li
                        key={i}
                        style={{
                          borderLeft: "3px solid #0d5c42",
                          paddingLeft: "1rem",
                        }}
                      >
                        <strong>{h.new_status}</strong>
                        {h.remarks && (
                          <p style={{ margin: "0.2rem 0 0", color: "#4d5d53" }}>
                            {h.remarks}
                          </p>
                        )}
                        <time style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          {new Date(h.created_at).toLocaleString("en-IN")}
                        </time>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </PortalFrame>
  );
}

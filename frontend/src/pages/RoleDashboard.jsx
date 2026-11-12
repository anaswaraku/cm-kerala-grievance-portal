import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_TITLE } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";
import {
  getRoleDashboard,
  getDistricts,
  getGrievances,
  getGrievanceCounts,
  getGrievanceDetail,
  getMyCitizenGrievances,
  submitGrievance,
  uploadAttachment,
  submitFeedback,
  changeGrievanceStatus,
  assignDepartment,
  getDepartments,
  submitReport,
  reviewReport,
} from "../services/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRIEVANCE_CATEGORIES = [
  "Roads & Public Infrastructure",
  "Water Supply",
  "Electricity",
  "Healthcare & Medical Services",
  "Education",
  "Sanitation & Waste Management",
  "Local Self Government",
  "Transportation",
  "Revenue & Land Services",
  "Public Distribution System (Ration)",
  "Police & Public Safety",
  "Social Welfare & Pensions",
  "Agriculture & Animal Husbandry",
  "Environment & Pollution",
  "Other Government Services",
];

const SELECT_STYLE = {
  border: "1px solid #c5d2c7",
  borderRadius: "10px",
  padding: "0.75rem 0.85rem",
  background: "white",
  font: "inherit",
};

const TEXTAREA_STYLE = {
  border: "1px solid #c5d2c7",
  borderRadius: "10px",
  padding: "0.75rem 0.85rem",
  background: "white",
  font: "inherit",
  resize: "vertical",
  minHeight: "5rem",
  width: "100%",
  boxSizing: "border-box",
};

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const statusBadge = (status) => {
  const colors = {
    Submitted: "#6b7280",
    "Under Review": "#2563eb",
    "In Progress": "#d97706",
    Resolved: "#16a34a",
    Reopened: "#dc2626",
  };
  return (
    <span
      style={{
        background: colors[status] || "#6b7280",
        color: "white",
        borderRadius: "999px",
        padding: "0.2rem 0.7rem",
        fontSize: "0.8rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

const priorityBadge = (priority) => {
  const colors = { High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };
  return (
    <span style={{ color: colors[priority] || "#6b7280", fontWeight: 600 }}>
      {priority}
    </span>
  );
};

// ─── Table styles ──────────────────────────────────────────────────────────────

const TH = {
  textAlign: "left",
  padding: "0.6rem 0.75rem",
  borderBottom: "2px solid #c5d2c7",
  fontWeight: 600,
  fontSize: "0.82rem",
  color: "#4d5d53",
  whiteSpace: "nowrap",
};

const TD = {
  padding: "0.55rem 0.75rem",
  borderBottom: "1px solid #e8f0ea",
  fontSize: "0.88rem",
  verticalAlign: "middle",
};

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function GrievanceDetailPanel({
  grievance,
  token,
  role,
  departments,
  onClose,
  onRefresh,
}) {
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    department_id: "",
    officer_id: "",
    remarks: "",
  });

  // Officer report form
  const [reportForm, setReportForm] = useState({
    investigation_remarks: "",
    action_taken: "",
    resolution_details: "",
  });
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const doStatusChange = async (status, remarks = "", visibility = "public") => {
    setActionBusy(true);
    setActionError("");
    setActionSuccess("");
    try {
      await changeGrievanceStatus(
        grievance.grievance.id,
        { status, remarks, visibility },
        token
      );
      setActionSuccess(`Status changed to "${status}".`);
      onRefresh();
    } catch (err) {
      setActionError(err.message || "Action failed");
    } finally {
      setActionBusy(false);
    }
  };

  const doAssign = async (e) => {
    e.preventDefault();
    setActionBusy(true);
    setActionError("");
    setActionSuccess("");
    try {
      await assignDepartment(
        grievance.grievance.id,
        {
          department_id: assignForm.department_id,
          officer_id: assignForm.officer_id || undefined,
          remarks: assignForm.remarks,
        },
        token
      );
      setActionSuccess("Department assigned and status moved to Under Review.");
      setShowAssign(false);
      onRefresh();
    } catch (err) {
      setActionError(err.message || "Assignment failed");
    } finally {
      setActionBusy(false);
    }
  };

  const doReviewReport = async (reportId, review_status) => {
    setActionBusy(true);
    setActionError("");
    setActionSuccess("");
    try {
      await reviewReport(reportId, { review_status }, token);
      setActionSuccess(`Report ${review_status}.`);
      onRefresh();
    } catch (err) {
      setActionError(err.message || "Review failed");
    } finally {
      setActionBusy(false);
    }
  };

  const doSubmitReport = async (e) => {
    e.preventDefault();
    setReportBusy(true);
    setReportError("");
    setReportSuccess("");
    try {
      await submitReport(
        {
          grievance_id: grievance.grievance.id,
          investigation_remarks: reportForm.investigation_remarks,
          action_taken: reportForm.action_taken,
          resolution_details: reportForm.resolution_details,
        },
        token
      );
      setReportSuccess("Report submitted successfully.");
      setReportForm({
        investigation_remarks: "",
        action_taken: "",
        resolution_details: "",
      });
      onRefresh();
    } catch (err) {
      setReportError(err.message || "Failed to submit report");
    } finally {
      setReportBusy(false);
    }
  };

  const g = grievance.grievance;
  const history = grievance.history || [];
  const attachments = grievance.attachments || [];
  const reports = grievance.reports || [];

  const canSubmitReport =
    role === "department_officer" &&
    !reports.some(
      (r) => r.review_status === "Pending" || r.review_status === "Accepted"
    );

  return (
    <div
      style={{
        background: "#f6faf7",
        border: "1px solid #c5d2c7",
        borderRadius: "14px",
        padding: "1.5rem",
        marginTop: "1.5rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>
            Grievance Detail
          </p>
          <h2 style={{ margin: "0.2rem 0 0", fontSize: "1.1rem" }}>
            {g.reference_number}
          </h2>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {statusBadge(g.status)}
          <button className="text-button" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Basic info */}
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "0.35rem 1rem",
          fontSize: "0.9rem",
        }}
      >
        <dt style={{ fontWeight: 600 }}>District</dt>
        <dd style={{ margin: 0 }}>{g.district}</dd>
        <dt style={{ fontWeight: 600 }}>Category</dt>
        <dd style={{ margin: 0 }}>{g.category}</dd>
        <dt style={{ fontWeight: 600 }}>Priority</dt>
        <dd style={{ margin: 0 }}>{priorityBadge(g.priority)}</dd>
        {g.department_name && (
          <>
            <dt style={{ fontWeight: 600 }}>Department</dt>
            <dd style={{ margin: 0 }}>{g.department_name}</dd>
          </>
        )}
        {g.citizen_name && (
          <>
            <dt style={{ fontWeight: 600 }}>Citizen</dt>
            <dd style={{ margin: 0 }}>{g.citizen_name}</dd>
          </>
        )}
        <dt style={{ fontWeight: 600 }}>Submitted</dt>
        <dd style={{ margin: 0 }}>
          {new Date(g.created_at).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </dd>
        {g.resolved_at && (
          <>
            <dt style={{ fontWeight: 600 }}>Resolved</dt>
            <dd style={{ margin: 0 }}>
              {new Date(g.resolved_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </>
        )}
      </dl>

      <h3 style={{ marginTop: "1.2rem", fontSize: "0.95rem" }}>Subject</h3>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>{g.subject}</p>
      <h3 style={{ marginTop: "1rem", fontSize: "0.95rem" }}>Description</h3>
      <p
        style={{
          margin: 0,
          fontSize: "0.9rem",
          whiteSpace: "pre-wrap",
          color: "#2d3f31",
        }}
      >
        {g.description}
      </p>

      {/* AI suggestions (CMO) */}
      {role === "cmo_admin" &&
        (g.ai_summary || g.ai_suggested_department || g.ai_suggested_category) && (
          <div
            style={{
              background: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: "10px",
              padding: "0.9rem 1rem",
              marginTop: "1rem",
            }}
          >
            <p
              className="eyebrow"
              style={{ margin: "0 0 0.4rem", color: "#2e7d32" }}
            >
              AI Suggestions
            </p>
            {g.ai_summary && (
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.88rem" }}>
                <strong>Summary:</strong> {g.ai_summary}
              </p>
            )}
            {g.ai_suggested_department && (
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.88rem" }}>
                <strong>Suggested Dept:</strong> {g.ai_suggested_department}
              </p>
            )}
            {g.ai_suggested_category && (
              <p style={{ margin: 0, fontSize: "0.88rem" }}>
                <strong>Suggested Category:</strong> {g.ai_suggested_category}
              </p>
            )}
            {g.ai_suggested_priority && (
              <p style={{ margin: 0, fontSize: "0.88rem" }}>
                <strong>Suggested Priority:</strong> {g.ai_suggested_priority}
              </p>
            )}
          </div>
        )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <>
          <h3 style={{ marginTop: "1.2rem", fontSize: "0.95rem" }}>
            Attachments
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.88rem" }}>
            {attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={att.file_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0d5c42" }}
                >
                  {att.file_name}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <h3 style={{ marginTop: "1.2rem", fontSize: "0.95rem" }}>
            Status History
          </h3>
          <ol
            style={{
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: "0.6rem",
            }}
          >
            {history.map((h, i) => (
              <li
                key={i}
                style={{ borderLeft: "3px solid #0d5c42", paddingLeft: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ fontSize: "0.88rem" }}>{h.new_status}</strong>
                  {h.visibility === "internal" && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: "#fef3c7",
                        color: "#92400e",
                        borderRadius: "999px",
                        padding: "0.1rem 0.5rem",
                        fontWeight: 600,
                      }}
                    >
                      Internal
                    </span>
                  )}
                </div>
                {h.remarks && (
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#4d5d53" }}>
                    {h.remarks}
                  </p>
                )}
                <time style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                  {new Date(h.created_at).toLocaleString("en-IN")}
                </time>
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Action-Taken Reports (CMO) */}
      {role === "cmo_admin" && reports.length > 0 && (
        <>
          <h3 style={{ marginTop: "1.2rem", fontSize: "0.95rem" }}>
            Action-Taken Reports
          </h3>
          {reports.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #c5d2c7",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "0.75rem",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  {r.officer_name || "Officer"}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    background:
                      r.review_status === "Accepted"
                        ? "#dcfce7"
                        : r.review_status === "Rejected"
                        ? "#fee2e2"
                        : "#fef3c7",
                    color:
                      r.review_status === "Accepted"
                        ? "#166534"
                        : r.review_status === "Rejected"
                        ? "#991b1b"
                        : "#92400e",
                    borderRadius: "999px",
                    padding: "0.15rem 0.6rem",
                    fontWeight: 600,
                  }}
                >
                  {r.review_status}
                </span>
              </div>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem" }}>
                <strong>Investigation:</strong> {r.investigation_remarks}
              </p>
              <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem" }}>
                <strong>Action Taken:</strong> {r.action_taken}
              </p>
              {r.resolution_details && (
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem" }}>
                  <strong>Resolution:</strong> {r.resolution_details}
                </p>
              )}
              {r.review_status === "Pending" && (
                <div
                  style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}
                >
                  <button
                    className="button primary"
                    style={{ padding: "0.3rem 0.9rem", fontSize: "0.82rem" }}
                    disabled={actionBusy}
                    onClick={() => doReviewReport(r.id, "Accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="button"
                    style={{
                      padding: "0.3rem 0.9rem",
                      fontSize: "0.82rem",
                      color: "#dc2626",
                    }}
                    disabled={actionBusy}
                    onClick={() => doReviewReport(r.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* CMO Action Buttons */}
      {role === "cmo_admin" && (
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <button
            className="button"
            disabled={actionBusy}
            onClick={() => doStatusChange("Under Review", "", "internal")}
          >
            Move to Under Review
          </button>
          <button
            className="button primary"
            disabled={actionBusy}
            onClick={() => setShowAssign((v) => !v)}
          >
            Assign Department
          </button>
          <button
            className="button"
            style={{ background: "#dcfce7", color: "#166534" }}
            disabled={actionBusy}
            onClick={() => doStatusChange("Resolved", "", "public")}
          >
            Mark Resolved
          </button>
          <button
            className="button"
            style={{ background: "#fee2e2", color: "#991b1b" }}
            disabled={actionBusy}
            onClick={() => doStatusChange("Reopened", "", "public")}
          >
            Reopen
          </button>
        </div>
      )}

      {/* Assign panel */}
      {role === "cmo_admin" && showAssign && (
        <form
          onSubmit={doAssign}
          style={{
            marginTop: "1rem",
            display: "grid",
            gap: "0.75rem",
            background: "white",
            border: "1px solid #c5d2c7",
            borderRadius: "10px",
            padding: "1rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "0.95rem" }}>Assign Department</h3>
          <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
            Department
            <select
              value={assignForm.department_id}
              onChange={(e) =>
                setAssignForm((f) => ({ ...f, department_id: e.target.value }))
              }
              required
              style={SELECT_STYLE}
            >
              <option value="">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
            Officer ID (optional)
            <input
              value={assignForm.officer_id}
              onChange={(e) =>
                setAssignForm((f) => ({ ...f, officer_id: e.target.value }))
              }
              placeholder="Officer user ID (optional)"
            />
          </label>
          <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
            Remarks
            <textarea
              value={assignForm.remarks}
              onChange={(e) =>
                setAssignForm((f) => ({ ...f, remarks: e.target.value }))
              }
              placeholder="Assignment remarks…"
              style={TEXTAREA_STYLE}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="button primary"
              type="submit"
              disabled={actionBusy}
            >
              {actionBusy ? "Assigning…" : "Confirm Assign"}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setShowAssign(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Officer In Progress Button */}
      {role === "department_officer" &&
        (g.status === "Submitted" || g.status === "Under Review") && (
          <div style={{ marginTop: "1.25rem" }}>
            <button
              className="button primary"
              disabled={actionBusy}
              onClick={() => doStatusChange("In Progress", "", "public")}
            >
              {actionBusy ? "Updating…" : "Mark as In Progress"}
            </button>
          </div>
        )}

      {/* Officer Report Form */}
      {canSubmitReport && (
        <form
          onSubmit={doSubmitReport}
          style={{ marginTop: "1.25rem", display: "grid", gap: "0.75rem" }}
        >
          <h3 style={{ margin: 0, fontSize: "0.95rem" }}>
            Submit Action Report
          </h3>
          <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
            Investigation Remarks *
            <textarea
              value={reportForm.investigation_remarks}
              onChange={(e) =>
                setReportForm((f) => ({
                  ...f,
                  investigation_remarks: e.target.value,
                }))
              }
              required
              placeholder="Describe your investigation…"
              style={TEXTAREA_STYLE}
            />
          </label>
          <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
            Action Taken *
            <textarea
              value={reportForm.action_taken}
              onChange={(e) =>
                setReportForm((f) => ({ ...f, action_taken: e.target.value }))
              }
              required
              placeholder="Describe the action taken…"
              style={TEXTAREA_STYLE}
            />
          </label>
          <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
            Resolution Details (optional)
            <textarea
              value={reportForm.resolution_details}
              onChange={(e) =>
                setReportForm((f) => ({
                  ...f,
                  resolution_details: e.target.value,
                }))
              }
              placeholder="Describe how it was resolved…"
              style={TEXTAREA_STYLE}
            />
          </label>
          {reportError && (
            <p className="error" role="alert">
              {reportError}
            </p>
          )}
          {reportSuccess && (
            <p style={{ color: "#0d5c42", fontWeight: 600 }}>{reportSuccess}</p>
          )}
          <button
            className="button primary"
            type="submit"
            disabled={reportBusy}
          >
            {reportBusy ? "Submitting…" : "Submit Report"}
          </button>
        </form>
      )}

      {/* Status messages */}
      {actionError && (
        <p className="error" role="alert" style={{ marginTop: "0.75rem" }}>
          {actionError}
        </p>
      )}
      {actionSuccess && (
        <p
          style={{ color: "#0d5c42", fontWeight: 600, marginTop: "0.75rem" }}
        >
          {actionSuccess}
        </p>
      )}
    </div>
  );
}

// ─── Citizen Dashboard ─────────────────────────────────────────────────────────

function CitizenDashboard({ session, signOut, message, serverError }) {
  const [form, setForm] = useState({
    district: "",
    category: "",
    subject: "",
    description: "",
  });
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [lastRefNum, setLastRefNum] = useState("");
  const fileInputRef = useRef(null);

  const [grievances, setGrievances] = useState([]);
  const [grievancesLoading, setGrievancesLoading] = useState(true);
  const [grievancesError, setGrievancesError] = useState("");

  // Feedback state: keyed by grievance id
  const [feedbackOpen, setFeedbackOpen] = useState({});
  const [feedbackForm, setFeedbackForm] = useState({});
  const [feedbackBusy, setFeedbackBusy] = useState({});
  const [feedbackDone, setFeedbackDone] = useState({});

  const loadGrievances = useCallback(() => {
    setGrievancesLoading(true);
    getMyCitizenGrievances(session.token)
      .then((data) => setGrievances(data.grievances || []))
      .catch((err) => {
        if (err.status === 401) signOut();
        else setGrievancesError(err.message);
      })
      .finally(() => setGrievancesLoading(false));
  }, [session.token, signOut]);

  useEffect(() => {
    getDistricts()
      .then((data) => setDistricts(data.districts || []))
      .catch((err) => setFormError("Could not load districts: " + err.message))
      .finally(() => setDistrictsLoading(false));
    loadGrievances();
  }, [loadGrievances]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!form.district || !form.category || !form.subject || !form.description) {
      setFormError("All fields are required.");
      return;
    }
    setFormBusy(true);
    try {
      const response = await submitGrievance(
        {
          district: form.district,
          category: form.category,
          subject: form.subject,
          description: form.description,
        },
        session.token
      );
      const refNum = response.grievance.reference_number;
      const gId = response.grievance.id;
      setLastRefNum(refNum);
      if (attachedFile) {
        try {
          await uploadAttachment(gId, attachedFile, session.token);
        } catch {
          // File upload failure is non-critical, grievance was submitted
        }
      }
      setFormSuccess(`Grievance submitted! Reference: ${refNum}`);
      setForm({ district: "", category: "", subject: "", description: "" });
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadGrievances();
    } catch (err) {
      setFormError(err.message || "Failed to submit grievance");
    } finally {
      setFormBusy(false);
    }
  };

  const toggleFeedback = (gId) => {
    setFeedbackOpen((prev) => ({ ...prev, [gId]: !prev[gId] }));
    if (!feedbackForm[gId]) {
      setFeedbackForm((prev) => ({ ...prev, [gId]: { rating: 0, feedback: "" } }));
    }
  };

  const handleFeedbackSubmit = async (gId) => {
    const fb = feedbackForm[gId] || {};
    if (!fb.rating) return;
    setFeedbackBusy((prev) => ({ ...prev, [gId]: true }));
    try {
      await submitFeedback(
        gId,
        { rating: fb.rating, feedback: fb.feedback },
        session.token
      );
      setFeedbackDone((prev) => ({ ...prev, [gId]: true }));
      setFeedbackOpen((prev) => ({ ...prev, [gId]: false }));
      loadGrievances();
    } catch {
      // silently ignore
    } finally {
      setFeedbackBusy((prev) => ({ ...prev, [gId]: false }));
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Welcome card */}
      <section className="dashboard-card">
        <p className="eyebrow">Signed in as citizen</p>
        <h1>{ROLE_TITLE["citizen"]}</h1>
        <p>Welcome, {session.user.name}.</p>
        {message && <p>{message}</p>}
        {serverError && (
          <p className="error" role="alert">
            {serverError}
          </p>
        )}
      </section>

      {/* Submit Grievance */}
      <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
        <h2>Submit New Grievance</h2>
        <p className="form-note">
          Describe your issue and submit it to the CM Kerala Grievance Portal.
        </p>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}
        >
          <label style={{ display: "grid", gap: "0.3rem" }}>
            District
            <select
              name="district"
              value={form.district}
              onChange={update}
              disabled={districtsLoading}
              required
              style={SELECT_STYLE}
            >
              <option value="">
                {districtsLoading ? "Loading…" : "-- Select District --"}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: "0.3rem" }}>
            Category
            <select
              name="category"
              value={form.category}
              onChange={update}
              required
              style={SELECT_STYLE}
            >
              <option value="">-- Select Category --</option>
              {GRIEVANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: "0.3rem" }}>
            Subject
            <input
              name="subject"
              type="text"
              value={form.subject}
              onChange={update}
              placeholder="Brief subject of your grievance"
              required
            />
          </label>
          <label style={{ display: "grid", gap: "0.3rem" }}>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              placeholder="Describe your grievance in detail…"
              required
              style={TEXTAREA_STYLE}
            />
          </label>

          {/* File attachment */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setAttachedFile(e.target.files[0] || null)}
            />
            <button
              type="button"
              className="text-button"
              onClick={() => fileInputRef.current?.click()}
            >
              {attachedFile ? `📎 ${attachedFile.name}` : "Attach a file (optional)"}
            </button>
            {attachedFile && (
              <button
                type="button"
                className="text-button"
                style={{ marginLeft: "0.5rem", color: "#dc2626" }}
                onClick={() => {
                  setAttachedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </button>
            )}
          </div>

          {formError && (
            <p className="error" role="alert">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p style={{ color: "#0d5c42", fontWeight: 600 }}>{formSuccess}</p>
          )}
          <button
            className="button primary"
            type="submit"
            disabled={formBusy || districtsLoading}
            style={{ justifySelf: "start" }}
          >
            {formBusy ? "Submitting…" : "Submit Grievance"}
          </button>
        </form>
      </section>

      {/* My Grievances */}
      <section
        className="dashboard-card"
        style={{ marginTop: "1.5rem", maxWidth: "none" }}
      >
        <h2>My Grievances</h2>
        {grievancesLoading && <p>Loading your grievances…</p>}
        {grievancesError && (
          <p className="error" role="alert">
            {grievancesError}
          </p>
        )}
        {!grievancesLoading && grievances.length === 0 && (
          <p className="form-note">You have not submitted any grievances yet.</p>
        )}
        {!grievancesLoading && grievances.length > 0 && (
          <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "52rem",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Ref #",
                    "District",
                    "Category",
                    "Subject",
                    "Status",
                    "Priority",
                    "Date",
                    "Feedback",
                  ].map((col) => (
                    <th key={col} scope="col" style={TH}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => {
                  const needsFeedback =
                    g.status === "Resolved" &&
                    !g.feedback_given &&
                    !feedbackDone[g.id];
                  return (
                    <>
                      <tr key={g.id}>
                        <td style={{ ...TD, fontFamily: "monospace" }}>
                          {g.reference_number}
                        </td>
                        <td style={TD}>{g.district}</td>
                        <td style={TD}>{g.category}</td>
                        <td style={TD}>{g.subject}</td>
                        <td style={TD}>{statusBadge(g.status)}</td>
                        <td style={TD}>{priorityBadge(g.priority)}</td>
                        <td style={{ ...TD, whiteSpace: "nowrap" }}>
                          {new Date(g.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td style={TD}>
                          {needsFeedback && (
                            <button
                              className="text-button"
                              style={{ color: "#0d5c42", fontSize: "0.82rem" }}
                              onClick={() => toggleFeedback(g.id)}
                            >
                              {feedbackOpen[g.id] ? "Cancel" : "⭐ Rate"}
                            </button>
                          )}
                          {feedbackDone[g.id] && (
                            <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                              Rated ✓
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Inline feedback row */}
                      {feedbackOpen[g.id] && (
                        <tr key={`${g.id}-feedback`}>
                          <td colSpan={8} style={{ ...TD, background: "#f6faf7" }}>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.75rem",
                                alignItems: "flex-start",
                                padding: "0.5rem 0",
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    margin: "0 0 0.4rem",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  Rating
                                </p>
                                <div style={{ display: "flex", gap: "0.3rem" }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() =>
                                        setFeedbackForm((prev) => ({
                                          ...prev,
                                          [g.id]: {
                                            ...(prev[g.id] || {}),
                                            rating: star,
                                          },
                                        }))
                                      }
                                      style={{
                                        width: "2rem",
                                        height: "2rem",
                                        border: "none",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        background:
                                          (feedbackForm[g.id]?.rating || 0) >=
                                          star
                                            ? "#0d5c42"
                                            : "#e8f0ea",
                                        color:
                                          (feedbackForm[g.id]?.rating || 0) >=
                                          star
                                            ? "white"
                                            : "#0d5c42",
                                      }}
                                    >
                                      {star}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ flex: "1 1 14rem" }}>
                                <p
                                  style={{
                                    margin: "0 0 0.4rem",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  Comment (optional)
                                </p>
                                <textarea
                                  value={feedbackForm[g.id]?.feedback || ""}
                                  onChange={(e) =>
                                    setFeedbackForm((prev) => ({
                                      ...prev,
                                      [g.id]: {
                                        ...(prev[g.id] || {}),
                                        feedback: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Share your experience…"
                                  style={{ ...TEXTAREA_STYLE, minHeight: "3rem" }}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.4rem",
                                  alignSelf: "flex-end",
                                }}
                              >
                                <button
                                  className="button primary"
                                  style={{
                                    padding: "0.3rem 0.9rem",
                                    fontSize: "0.82rem",
                                  }}
                                  disabled={
                                    feedbackBusy[g.id] ||
                                    !feedbackForm[g.id]?.rating
                                  }
                                  onClick={() => handleFeedbackSubmit(g.id)}
                                >
                                  {feedbackBusy[g.id] ? "Saving…" : "Submit"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── CMO Dashboard ─────────────────────────────────────────────────────────────

function CmoDashboard({ session, signOut, message, serverError }) {
  const [counts, setCounts] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [grievancesLoading, setGrievancesLoading] = useState(true);
  const [grievancesError, setGrievancesError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [filterForm, setFilterForm] = useState({
    district: "",
    category: "",
    priority: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadGrievances = useCallback(
    (params = {}) => {
      setGrievancesLoading(true);
      setGrievancesError("");
      getGrievances(session.token, params)
        .then((data) => setGrievances(data.grievances || []))
        .catch((err) => {
          if (err.status === 401) signOut();
          else setGrievancesError(err.message);
        })
        .finally(() => setGrievancesLoading(false));
    },
    [session.token, signOut]
  );

  const loadDetail = useCallback(
    async (id) => {
      setDetailLoading(true);
      try {
        const data = await getGrievanceDetail(id, session.token);
        setSelectedGrievance(data);
      } catch (err) {
        if (err.status === 401) signOut();
      } finally {
        setDetailLoading(false);
      }
    },
    [session.token, signOut]
  );

  useEffect(() => {
    getGrievanceCounts(session.token)
      .then((data) => setCounts(data))
      .catch(() => {});
    getDepartments()
      .then((data) => setDepartments(data.departments || []))
      .catch(() => {});
    loadGrievances();
  }, [loadGrievances, session.token]);

  const applyFilters = () => {
    setAppliedFilters({ ...filterForm });
    loadGrievances({ ...filterForm });
    setSelectedGrievance(null);
  };

  const clearFilters = () => {
    const empty = { district: "", category: "", priority: "", status: "" };
    setFilterForm(empty);
    setAppliedFilters({});
    loadGrievances({});
    setSelectedGrievance(null);
  };

  const STAT_CARDS = counts
    ? [
        { label: "Total", value: counts.total, color: "#0d5c42" },
        { label: "Submitted", value: counts.submitted, color: "#6b7280" },
        { label: "Under Review", value: counts.under_review, color: "#2563eb" },
        { label: "In Progress", value: counts.in_progress, color: "#d97706" },
        { label: "Resolved", value: counts.resolved, color: "#16a34a" },
        { label: "Overdue", value: counts.overdue, color: "#dc2626" },
      ]
    : [];

  return (
    <div className="dashboard-layout">
      {/* Welcome */}
      <section className="dashboard-card">
        <p className="eyebrow">Signed in as CMO Administrator</p>
        <h1>{ROLE_TITLE["cmo_admin"]}</h1>
        <p>Welcome, {session.user.name}.</p>
        {message && <p>{message}</p>}
        {serverError && (
          <p className="error" role="alert">
            {serverError}
          </p>
        )}
      </section>

      {/* Stats */}
      {counts && (
        <section style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
              gap: "1rem",
            }}
          >
            {STAT_CARDS.map((s) => (
              <div
                key={s.label}
                className="dashboard-card"
                style={{ textAlign: "center", padding: "1.1rem 0.75rem" }}
              >
                <p
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 700,
                    color: s.color,
                    margin: 0,
                  }}
                >
                  {s.value ?? "—"}
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "#4d5d53" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.75rem" }}>All Grievances</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            alignItems: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <input
            value={filterForm.district}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, district: e.target.value }))
            }
            placeholder="District…"
            style={{ flex: "1 1 9rem", minWidth: "9rem" }}
          />
          <select
            value={filterForm.category}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, category: e.target.value }))
            }
            style={{ ...SELECT_STYLE, flex: "1 1 11rem", minWidth: "11rem" }}
          >
            <option value="">All Categories</option>
            {GRIEVANCE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterForm.priority}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, priority: e.target.value }))
            }
            style={{ ...SELECT_STYLE, flex: "0 1 9rem" }}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterForm.status}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, status: e.target.value }))
            }
            style={{ ...SELECT_STYLE, flex: "0 1 11rem" }}
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Reopened">Reopened</option>
          </select>
          <button className="button primary" onClick={applyFilters}>
            Apply
          </button>
          <button className="text-button" onClick={clearFilters}>
            Clear
          </button>
        </div>

        {grievancesLoading && <p>Loading grievances…</p>}
        {grievancesError && (
          <p className="error" role="alert">
            {grievancesError}
          </p>
        )}
        {!grievancesLoading && grievances.length === 0 && (
          <p className="form-note">No grievances found.</p>
        )}
        {!grievancesLoading && grievances.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "60rem",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Ref #",
                    "Citizen",
                    "District",
                    "Category",
                    "Priority",
                    "Status",
                    "Date",
                    "Reports",
                    "",
                  ].map((col, i) => (
                    <th key={i} scope="col" style={TH}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr
                    key={g.reference_number}
                    style={{
                      background:
                        selectedGrievance?.grievance?.reference_number ===
                        g.reference_number
                          ? "#f0faf3"
                          : undefined,
                    }}
                  >
                    <td style={{ ...TD, fontFamily: "monospace" }}>
                      {g.reference_number}
                    </td>
                    <td style={TD}>{g.citizen_name || "—"}</td>
                    <td style={TD}>{g.district}</td>
                    <td style={TD}>{g.category}</td>
                    <td style={TD}>{priorityBadge(g.priority)}</td>
                    <td style={TD}>{statusBadge(g.status)}</td>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>
                      {new Date(g.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}>
                      {g.report_count ?? 0}
                    </td>
                    <td style={TD}>
                      <button
                        className="text-button"
                        style={{ color: "#0d5c42", fontWeight: 600 }}
                        onClick={() => loadDetail(g.id || g.reference_number)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detailLoading && (
          <p style={{ marginTop: "1rem", color: "#4d5d53" }}>
            Loading detail…
          </p>
        )}

        {selectedGrievance && !detailLoading && (
          <GrievanceDetailPanel
            grievance={selectedGrievance}
            token={session.token}
            role="cmo_admin"
            departments={departments}
            onClose={() => setSelectedGrievance(null)}
            onRefresh={() => {
              loadDetail(selectedGrievance.grievance.id);
              loadGrievances(appliedFilters);
              getGrievanceCounts(session.token)
                .then((data) => setCounts(data))
                .catch(() => {});
            }}
          />
        )}
      </section>
    </div>
  );
}

// ─── Officer Dashboard ─────────────────────────────────────────────────────────

function OfficerDashboard({ session, signOut, message, serverError }) {
  const [grievances, setGrievances] = useState([]);
  const [grievancesLoading, setGrievancesLoading] = useState(true);
  const [grievancesError, setGrievancesError] = useState("");
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadGrievances = useCallback(() => {
    setGrievancesLoading(true);
    getGrievances(session.token)
      .then((data) => setGrievances(data.grievances || []))
      .catch((err) => {
        if (err.status === 401) signOut();
        else setGrievancesError(err.message);
      })
      .finally(() => setGrievancesLoading(false));
  }, [session.token, signOut]);

  const loadDetail = useCallback(
    async (id) => {
      setDetailLoading(true);
      try {
        const data = await getGrievanceDetail(id, session.token);
        setSelectedGrievance(data);
      } catch (err) {
        if (err.status === 401) signOut();
      } finally {
        setDetailLoading(false);
      }
    },
    [session.token, signOut]
  );

  useEffect(() => {
    loadGrievances();
  }, [loadGrievances]);

  return (
    <div className="dashboard-layout">
      {/* Welcome */}
      <section className="dashboard-card">
        <p className="eyebrow">Signed in as Department Officer</p>
        <h1>{ROLE_TITLE["department_officer"]}</h1>
        <p>Welcome, {session.user.name}.</p>
        {message && <p>{message}</p>}
        {serverError && (
          <p className="error" role="alert">
            {serverError}
          </p>
        )}
      </section>

      {/* Grievances */}
      <section
        className="dashboard-card"
        style={{ marginTop: "1.5rem", maxWidth: "none" }}
      >
        <h2>Department Grievances</h2>
        {grievancesLoading && <p>Loading grievances…</p>}
        {grievancesError && (
          <p className="error" role="alert">
            {grievancesError}
          </p>
        )}
        {!grievancesLoading && grievances.length === 0 && (
          <p className="form-note">No grievances assigned to your department.</p>
        )}
        {!grievancesLoading && grievances.length > 0 && (
          <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "50rem",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Ref #",
                    "District",
                    "Category",
                    "Priority",
                    "Status",
                    "Date",
                    "",
                  ].map((col, i) => (
                    <th key={i} scope="col" style={TH}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr
                    key={g.reference_number}
                    style={{
                      background:
                        selectedGrievance?.grievance?.reference_number ===
                        g.reference_number
                          ? "#f0faf3"
                          : undefined,
                    }}
                  >
                    <td style={{ ...TD, fontFamily: "monospace" }}>
                      {g.reference_number}
                    </td>
                    <td style={TD}>{g.district}</td>
                    <td style={TD}>{g.category}</td>
                    <td style={TD}>{priorityBadge(g.priority)}</td>
                    <td style={TD}>{statusBadge(g.status)}</td>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>
                      {new Date(g.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td style={TD}>
                      <button
                        className="text-button"
                        style={{ color: "#0d5c42", fontWeight: 600 }}
                        onClick={() => loadDetail(g.id || g.reference_number)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detailLoading && (
          <p style={{ marginTop: "1rem", color: "#4d5d53" }}>
            Loading detail…
          </p>
        )}

        {selectedGrievance && !detailLoading && (
          <GrievanceDetailPanel
            grievance={selectedGrievance}
            token={session.token}
            role="department_officer"
            departments={[]}
            onClose={() => setSelectedGrievance(null)}
            onRefresh={() => {
              loadDetail(selectedGrievance.grievance.id);
              loadGrievances();
            }}
          />
        )}
      </section>
    </div>
  );
}

// ─── Root Component ────────────────────────────────────────────────────────────

export default function RoleDashboard({ role }) {
  const { session, signOut } = useAuth();
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let active = true;
    getRoleDashboard(role, session.token)
      .then((data) => {
        if (active) setMessage(data.message || "");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setServerError(err.message);
      });
    return () => {
      active = false;
    };
  }, [role, session.token, signOut]);

  const sharedProps = { session, signOut, message, serverError };

  return (
    <PortalFrame
      action={
        <button className="text-button" type="button" onClick={signOut}>
          Log out
        </button>
      }
    >
      {role === "citizen" && <CitizenDashboard {...sharedProps} />}
      {role === "cmo_admin" && <CmoDashboard {...sharedProps} />}
      {role === "department_officer" && <OfficerDashboard {...sharedProps} />}
    </PortalFrame>
  );
}

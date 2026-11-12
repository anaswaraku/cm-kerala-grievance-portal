import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_TITLE } from "../auth/roles";
import PortalFrame from "../components/PortalFrame";
import { getRoleDashboard, getDistricts, submitGrievance } from "../services/api";

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

export default function RoleDashboard({ role }) {
  const { session, signOut } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

    // --- Grievance Form State ---
  const [form, setForm] = useState({
    name: session?.user?.name || "",
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

  useEffect(() => {
    let active = true;
    getRoleDashboard(role, session.token)
      .then((data) => {
        if (active) setMessage(data.message);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) signOut();
        else setError(requestError.message);
      });

       // If citizen, load districts for the dropdown
    if (role === "citizen") {
      getDistricts()
        .then((data) => {
          if (active) setDistricts(data.districts || []);
        })
        .catch((err) => {
          if (active) setFormError("Could not load districts: " + err.message);
        })
        .finally(() => {
          if (active) setDistrictsLoading(false);
        });
    }


    return () => {
      active = false;
    };
  }, [role, session.token, signOut]);
  const update = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleGrievanceSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    const requiredFields = {
      district: "district",
      category: "category",
      subject: "subject",
      description: "description",
    };
    const missingField = Object.keys(requiredFields).find(
      (field) => !String(form[field] || "").trim()
    );
    if (missingField) {
      setFormError(`Please provide a ${requiredFields[missingField]}`);
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
      setFormSuccess(`Grievance submitted successfully! Reference: ${response.grievance.reference_number}`);
      setForm({
        name: session?.user?.name || "",
        district: "",
        category: "",
        subject: "",
        description: "",
      });
    } catch (err) {
      setFormError(err.message || "Failed to submit grievance");
    } finally {
      setFormBusy(false);
    }
  };
  return (
    <PortalFrame
      action={
        <button className="text-button" type="button" onClick={signOut}>
          Log out
        </button>
      }
    >
      <main className="dashboard-layout">
        <section className="dashboard-card">
          <p className="eyebrow">
            Signed in as {session.user.role.replaceAll("_", " ")}
          </p>
          <h1>{ROLE_TITLE[role]}</h1>
          <p>Welcome, {session.user.name}.</p>
          {message && <p>{message}</p>}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
        {/* --- Citizen Form Section --- */}
        {role === "citizen" && (
          <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
            <h2>Submit a Grievance</h2>
            <p className="form-note">
              Enter your name and choose your district to file a record.
            </p>
            <form
              onSubmit={handleGrievanceSubmit}
              style={{
                display: "grid",
                gap: "1rem",
                maxWidth: "30rem",
                marginTop: "1rem",
              }}
            >
              <label>
                Applicant Name
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={update}
                  placeholder="Enter full name"
                  readOnly
                  required
                />
              </label>
              <label>
                District
                <select
                  name="district"
                  value={form.district}
                  onChange={update}
                  disabled={districtsLoading}
                  required
                  style={{
                    border: "1px solid #c5d2c7",
                    borderRadius: "10px",
                    padding: "0.75rem 0.85rem",
                    background: "white",
                    font: "inherit",
                  }}
                >
                  <option value="">
                    {districtsLoading
                      ? "Loading districts…"
                      : "-- Select District --"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={update}
                  required
                  style={{
                    border: "1px solid #c5d2c7",
                    borderRadius: "10px",
                    padding: "0.75rem 0.85rem",
                    background: "white",
                    font: "inherit",
                  }}
                >
                  <option value="">-- Select Category --</option>
                  {GRIEVANCE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Subject
                <input
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={update}
                  placeholder="Enter subject"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={update}
                  placeholder="Describe your grievance in detail"
                  required
                />
              </label>
              {formError && (
                <p className="error" role="alert">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p style={{ color: "#0d5c42", fontWeight: "600" }}>
                  {formSuccess}
                </p>
              )}
              <button
                className="button primary"
                type="submit"
                disabled={formBusy || districtsLoading}
              >
                {formBusy ? "Submitting…" : "Save Grievance"}
              </button>
            </form>
          </section>
        )}
      </main>
    </PortalFrame>
  );
}
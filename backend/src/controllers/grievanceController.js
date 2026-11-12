"use strict";

const pool = require("../config/db");
const aiService = require("../services/aiService");

// ============================================================
// GET /api/grievances/districts  (public)
// ============================================================
const getDistricts = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM districts ORDER BY name ASC"
    );
    res.json({ status: "success", districts: result.rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/grievances/analyze  (citizen only)
// ============================================================
const analyzeGrievance = async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const subject = String(body.subject || "").trim();
  const description = String(body.description || "").trim();

  if (!subject || !description) {
    return res
      .status(400)
      .json({ message: "Subject and description are required for analysis." });
  }

  try {
    const deptResult = await pool.query(
      "SELECT name FROM departments WHERE is_active = TRUE ORDER BY name ASC"
    );
    const result = await aiService.analyzeGrievance({
      subject,
      description,
      departments: deptResult.rows.map((row) => row.name),
    });

    if (!result) {
      return res.status(503).json({
        message: "AI analysis is currently unavailable. You can still submit your grievance.",
      });
    }

    res.json({ status: "success", analysis: result });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/grievances  (citizen only)
// ============================================================
const createGrievance = async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const district = String(body.district || "").trim();
  const category = String(body.category || "").trim();
  const subject = String(body.subject || "").trim();
  const description = String(body.description || "").trim();
  const priority = String(body.priority || "Medium").trim();
  const citizenId = req.user.id;

  const missing = [];
  if (!district) missing.push("district");
  if (!category) missing.push("category");
  if (!subject) missing.push("subject");
  if (!description) missing.push("description");

  if (missing.length) {
    return res
      .status(400)
      .json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  try {
    const referenceNumber = `KL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const result = await pool.query(
      `INSERT INTO grievances
         (reference_number, citizen_id, district, category, subject, description, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [referenceNumber, citizenId, district, category, subject, description, priority]
    );

    const grievance = result.rows[0];

    // Insert first history entry
    await pool.query(
      `INSERT INTO grievance_history
         (grievance_id, new_status, remarks, changed_by, visibility)
       VALUES ($1, $2, $3, $4, $5)`,
      [grievance.id, "Submitted", "Grievance submitted by citizen", citizenId, "public"]
    );

    // AI analysis in background (non-blocking)
    setImmediate(async () => {
      try {
        // Fetch department names for context
        const deptResult = await pool.query(
          "SELECT name FROM departments WHERE is_active = TRUE"
        );
        const departments = deptResult.rows.map((r) => r.name);

        const aiResult = await aiService.analyzeGrievance({
          subject,
          description,
          departments,
        });

        if (aiResult) {
          await pool.query(
            `UPDATE grievances SET
               ai_summary = $1,
               ai_suggested_department = $2,
               ai_suggested_category = $3,
               ai_suggested_priority = $4,
               updated_at = NOW()
             WHERE id = $5`,
            [
              aiResult.summary,
              aiResult.suggested_department,
              aiResult.suggested_category,
              aiResult.suggested_priority,
              grievance.id,
            ]
          );
        }
      } catch (aiErr) {
        // Silent — AI is optional
        console.error("[createGrievance] AI analysis error:", aiErr.message);
      }
    });

    res.status(201).json({
      status: "success",
      message: "Grievance submitted successfully",
      grievance,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/grievances/my  (citizen only)
// ============================================================
const getMyCitizenGrievances = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT g.id, g.reference_number, g.district, g.category, g.subject, g.description,
              g.status, g.priority, g.created_at, g.resolved_at, g.ai_summary,
              d.name AS department_name
       FROM grievances g
       LEFT JOIN departments d ON d.id = g.current_department_id
       WHERE g.citizen_id = $1
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json({ status: "success", grievances: result.rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/grievances  (cmo_admin + department_officer)
// ============================================================
const getAllGrievances = async (req, res, next) => {
  try {
    const isOfficer = req.user.role === "department_officer";

    if (isOfficer) {
      const result = await pool.query(
        `SELECT g.*,
                u.name AS citizen_name,
                d.name AS department_name,
                (SELECT COUNT(*) FROM action_taken_reports atr WHERE atr.grievance_id = g.id) AS report_count
         FROM grievances g
         LEFT JOIN users u ON u.id = g.citizen_id
         LEFT JOIN departments d ON d.id = g.current_department_id
         WHERE g.current_department_id = $1
         ORDER BY g.created_at DESC`,
        [req.user.department_id]
      );
      return res.json({ status: "success", grievances: result.rows });
    }

    // CMO: dynamic filter from query params
    const { district, status, category, priority } = req.query;
    const conditions = [];
    const values = [];

    if (district) {
      values.push(district);
      conditions.push(`g.district = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`g.status = $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`g.category = $${values.length}`);
    }
    if (priority) {
      values.push(priority);
      conditions.push(`g.priority = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT g.*,
              u.name AS citizen_name,
              u.email AS citizen_email,
              d.name AS department_name,
              (SELECT COUNT(*) FROM action_taken_reports atr WHERE atr.grievance_id = g.id) AS report_count
       FROM grievances g
       LEFT JOIN users u ON u.id = g.citizen_id
       LEFT JOIN departments d ON d.id = g.current_department_id
       ${whereClause}
       ORDER BY g.created_at DESC`,
      values
    );

    res.json({ status: "success", grievances: result.rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/grievances/:id  (cmo_admin + department_officer)
// ============================================================
const getGrievanceDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isOfficer = req.user.role === "department_officer";

    // Main grievance row
    const grievanceResult = await pool.query(
      `SELECT g.*,
              u.name AS citizen_name, u.email AS citizen_email,
              d.name AS department_name,
              o.name AS assigned_officer_name
       FROM grievances g
       LEFT JOIN users u ON u.id = g.citizen_id
       LEFT JOIN departments d ON d.id = g.current_department_id
       LEFT JOIN users o ON o.id = g.assigned_officer_id
       WHERE g.id = $1`,
      [id]
    );

    if (!grievanceResult.rows.length) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const grievance = grievanceResult.rows[0];

    // Officer access control
    if (
      isOfficer &&
      grievance.current_department_id !== req.user.department_id
    ) {
      return res
        .status(403)
        .json({ message: "Access denied to this grievance" });
    }

    // History (cmo sees all, officer sees public only)
    const historyResult = await pool.query(
      `SELECT gh.*, u.name AS changed_by_name
       FROM grievance_history gh
       LEFT JOIN users u ON u.id = gh.changed_by
       WHERE gh.grievance_id = $1
         ${isOfficer ? "AND gh.visibility = 'public'" : ""}
       ORDER BY gh.created_at ASC`,
      [id]
    );

    // Attachments
    const attachmentsResult = await pool.query(
      "SELECT * FROM attachments WHERE grievance_id = $1 ORDER BY uploaded_at ASC",
      [id]
    );

    // Reports
    const reportsResult = await pool.query(
      `SELECT atr.*, u.name AS officer_name
       FROM action_taken_reports atr
       LEFT JOIN users u ON u.id = atr.officer_id
       WHERE atr.grievance_id = $1
       ORDER BY atr.submitted_at DESC`,
      [id]
    );

    res.json({
      status: "success",
      grievance,
      history: historyResult.rows,
      attachments: attachmentsResult.rows,
      reports: reportsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PATCH /api/grievances/:id/status  (cmo_admin + department_officer)
// ============================================================
const changeGrievanceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const newStatus = String(body.status || "").trim();
    const remarks = String(body.remarks || "").trim();
    const visibility = String(body.visibility || "public").trim();
    const isOfficer = req.user.role === "department_officer";

    if (!newStatus) {
      return res.status(400).json({ message: "status is required" });
    }

    // Fetch current grievance
    const gr = await pool.query("SELECT * FROM grievances WHERE id = $1", [id]);
    if (!gr.rows.length) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    const grievance = gr.rows[0];

    // Officer restrictions
    if (isOfficer) {
      if (grievance.current_department_id !== req.user.department_id) {
        return res
          .status(403)
          .json({ message: "Access denied to this grievance" });
      }
      if (newStatus !== "In Progress") {
        return res
          .status(403)
          .json({ message: "Officers may only set status to 'In Progress'" });
      }
    }

    const extraSet =
      newStatus === "Resolved" ? ", resolved_at = NOW()" : "";

    await pool.query(
      `UPDATE grievances
       SET status = $1, updated_at = NOW()${extraSet}
       WHERE id = $2`,
      [newStatus, id]
    );

    await pool.query(
      `INSERT INTO grievance_history
         (grievance_id, previous_status, new_status, remarks, changed_by, visibility)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, grievance.status, newStatus, remarks, req.user.id, visibility]
    );

    res.json({ status: "success", message: "Status updated" });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/grievances/:id/assign  (cmo_admin only)
// ============================================================
const assignDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { department_id, officer_id, remarks } = body;

    if (!department_id) {
      return res.status(400).json({ message: "department_id is required" });
    }

    // Check grievance exists
    const gr = await pool.query("SELECT * FROM grievances WHERE id = $1", [id]);
    if (!gr.rows.length) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Mark old assignments as not current
    await pool.query(
      "UPDATE department_assignments SET is_current = FALSE WHERE grievance_id = $1",
      [id]
    );

    // Insert new assignment
    await pool.query(
      `INSERT INTO department_assignments
         (grievance_id, department_id, assigned_officer_id, assigned_by, assignment_remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, department_id, officer_id || null, req.user.id, remarks || null]
    );

    // Update grievance
    await pool.query(
      `UPDATE grievances
       SET current_department_id = $1,
           assigned_officer_id = $2,
           status = 'In Progress',
           updated_at = NOW()
       WHERE id = $3`,
      [department_id, officer_id || null, id]
    );

    // History entry
    await pool.query(
      `INSERT INTO grievance_history
         (grievance_id, previous_status, new_status, remarks, changed_by, visibility)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        gr.rows[0].status,
        "In Progress",
        remarks || "Assigned to department",
        req.user.id,
        "internal",
      ]
    );

    res.json({ status: "success", message: "Department assigned" });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/grievances/track/:ref  (public, no auth)
// ============================================================
const trackGrievance = async (req, res, next) => {
  try {
    const { ref } = req.params;

    const result = await pool.query(
      `SELECT g.reference_number, g.district, g.category, g.subject, g.description,
              g.status, g.priority, g.created_at, g.resolved_at,
              d.name AS department_name
       FROM grievances g
       LEFT JOIN departments d ON d.id = g.current_department_id
       WHERE g.reference_number = $1`,
      [ref]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const grievance = result.rows[0];

    // Public history only
    const history = await pool.query(
      `SELECT previous_status, new_status, remarks, created_at
       FROM grievance_history
       WHERE grievance_id = (SELECT id FROM grievances WHERE reference_number = $1)
         AND visibility = 'public'
       ORDER BY created_at ASC`,
      [ref]
    );

    res.json({
      status: "success",
      grievance,
      history: history.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/grievances/:id/attachments  (citizen only)
// ============================================================
const uploadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Verify grievance belongs to this citizen
    const gr = await pool.query(
      "SELECT id FROM grievances WHERE id = $1 AND citizen_id = $2",
      [id, req.user.id]
    );
    if (!gr.rows.length) {
      return res
        .status(403)
        .json({ message: "Access denied or grievance not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO attachments
         (grievance_id, uploaded_by, file_name, file_url, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        req.user.id,
        req.file.originalname,
        fileUrl,
        req.file.mimetype,
        req.file.size,
      ]
    );

    res.status(201).json({ status: "success", attachment: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/grievances/:id/feedback  (citizen only)
// ============================================================
const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const rating = parseInt(body.rating, 10);
    const feedback = String(body.feedback || "").trim();

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "rating must be an integer between 1 and 5" });
    }

    // Verify grievance belongs to citizen and is Resolved
    const gr = await pool.query(
      "SELECT id, status FROM grievances WHERE id = $1 AND citizen_id = $2",
      [id, req.user.id]
    );

    if (!gr.rows.length) {
      return res
        .status(403)
        .json({ message: "Access denied or grievance not found" });
    }
    if (gr.rows[0].status !== "Resolved") {
      return res
        .status(400)
        .json({ message: "Feedback can only be submitted for resolved grievances" });
    }

    await pool.query(
      `INSERT INTO citizen_feedback (grievance_id, citizen_id, rating, feedback)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (grievance_id) DO NOTHING`,
      [id, req.user.id, rating, feedback]
    );

    res.json({ status: "success", message: "Feedback submitted" });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/grievances/counts  (cmo_admin)
// ============================================================
const getGrievanceCounts = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'Submitted') AS submitted,
         COUNT(*) FILTER (WHERE status = 'Under Review') AS under_review,
         COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress,
         COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved,
         COUNT(*) FILTER (WHERE status = 'Reopened') AS reopened,
         COUNT(*) FILTER (WHERE status NOT IN ('Resolved') AND created_at < NOW() - INTERVAL '30 days') AS overdue
       FROM grievances`
    );
    res.json({ status: "success", counts: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDistricts,
  analyzeGrievance,
  createGrievance,
  getMyCitizenGrievances,
  getAllGrievances,
  getGrievanceDetail,
  changeGrievanceStatus,
  assignDepartment,
  trackGrievance,
  uploadAttachment,
  submitFeedback,
  getGrievanceCounts,
};

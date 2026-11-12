"use strict";

const pool = require("../config/db");

// ============================================================
// POST /api/reports (department_officer)
// ============================================================
const submitReport = async (req, res, next) => {
  const { grievance_id, investigation_remarks, action_taken, resolution_details } = req.body;

  if (!grievance_id || !investigation_remarks || !action_taken) {
    return res.status(400).json({
      message: "Grievance ID, investigation remarks, and action taken are required",
    });
  }

  try {
    // Verify that the grievance is assigned to this officer's department
    const gr = await pool.query(
      "SELECT id, current_department_id, status FROM grievances WHERE id = $1",
      [grievance_id]
    );

    if (gr.rowCount === 0) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    if (gr.rows[0].current_department_id !== req.user.department_id) {
      return res.status(403).json({
        message: "You are not authorized to submit reports for this grievance",
      });
    }

    const result = await pool.query(
      `INSERT INTO action_taken_reports
         (grievance_id, officer_id, investigation_remarks, action_taken, resolution_details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [grievance_id, req.user.id, investigation_remarks, action_taken, resolution_details || null]
    );

    // Record progress remark in grievance history
    await pool.query(
      `INSERT INTO grievance_history
         (grievance_id, previous_status, new_status, remarks, changed_by, visibility)
       VALUES ($1, $2, $3, $4, $5, 'internal')`,
      [
        grievance_id,
        gr.rows[0].status,
        gr.rows[0].status,
        "Action taken report submitted by department officer",
        req.user.id,
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Action taken report submitted successfully for CMO review",
      report: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PATCH /api/reports/:id/review (cmo_admin)
// ============================================================
const reviewReport = async (req, res, next) => {
  const { id } = req.params;
  const { review_status, cmo_remarks } = req.body;

  if (!["Accepted", "Rejected"].includes(review_status)) {
    return res.status(400).json({
      message: "review_status must be either 'Accepted' or 'Rejected'",
    });
  }

  try {
    const reportRes = await pool.query(
      "SELECT * FROM action_taken_reports WHERE id = $1",
      [id]
    );

    if (reportRes.rowCount === 0) {
      return res.status(404).json({ message: "Action report not found" });
    }

    const report = reportRes.rows[0];

    // Update report review status
    await pool.query(
      `UPDATE action_taken_reports
       SET reviewed_by = $1, reviewed_at = NOW(), review_status = $2, cmo_remarks = $3
       WHERE id = $4`,
      [req.user.id, review_status, cmo_remarks || null, id]
    );

    if (review_status === "Accepted") {
      // Mark grievance as Resolved
      await pool.query(
        `UPDATE grievances
         SET status = 'Resolved', resolved_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [report.grievance_id]
      );

      await pool.query(
        `INSERT INTO grievance_history
           (grievance_id, previous_status, new_status, remarks, changed_by, visibility)
         VALUES ($1, 'In Progress', 'Resolved', $2, $3, 'public')`,
        [
          report.grievance_id,
          cmo_remarks || "Grievance resolved following department action",
          req.user.id,
        ]
      );
    } else {
      // Rejected: record remark in history
      await pool.query(
        `INSERT INTO grievance_history
           (grievance_id, previous_status, new_status, remarks, changed_by, visibility)
         VALUES ($1, 'In Progress', 'In Progress', $2, $3, 'internal')`,
        [
          report.grievance_id,
          `Action report rejected by CMO: ${cmo_remarks || "Needs further action"}`,
          req.user.id,
        ]
      );
    }

    res.json({
      status: "success",
      message: `Report ${review_status.toLowerCase()} successfully`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitReport, reviewReport };


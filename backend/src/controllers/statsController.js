"use strict";

const pool = require("../config/db");

// ============================================================
// GET /api/stats (public overview stats for homepage)
// ============================================================
const getPublicStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved,
        COUNT(*) FILTER (WHERE status IN ('Submitted', 'Under Review', 'In Progress'))::int AS pending,
        COUNT(DISTINCT district)::int AS districts_served
      FROM grievances
    `);

    const stats = result.rows[0] || { total: 0, resolved: 0, pending: 0, districts_served: 14 };
    // Ensure minimum display numbers for demo if empty
    res.json({
      status: "success",
      stats: {
        total: stats.total || 0,
        resolved: stats.resolved || 0,
        pending: stats.pending || 0,
        districts_served: stats.districts_served || 14,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/stats/by-district (cmo_admin)
// ============================================================
const getDistrictStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        district,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved,
        COUNT(*) FILTER (WHERE status != 'Resolved')::int AS pending
      FROM grievances
      GROUP BY district
      ORDER BY total DESC
    `);

    res.json({ status: "success", districts: result.rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/stats/by-department (cmo_admin)
// ============================================================
const getDepartmentStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        COUNT(g.id)::int AS total,
        COUNT(g.id) FILTER (WHERE g.status = 'Resolved')::int AS resolved,
        COUNT(g.id) FILTER (WHERE g.status != 'Resolved')::int AS pending
      FROM departments d
      LEFT JOIN grievances g ON g.current_department_id = d.id
      WHERE d.is_active = TRUE
      GROUP BY d.id, d.name
      ORDER BY total DESC
    `);

    res.json({ status: "success", departments: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicStats, getDistrictStats, getDepartmentStats };


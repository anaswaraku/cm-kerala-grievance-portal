const pool = require("../config/db");

// 1. Fetch districts for the dropdown
const getDistricts = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, name FROM districts ORDER BY name ASC");
    res.json({ status: "success", districts: result.rows });
  } catch (error) {
    next(error);
  }
};
const getGrievances = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT reference_number,citizen_id,district,category,subject,description,created_at,updated_at,resolved_at FROM grievances ORDER BY created_at ASC",
    );
    res.json({ status: "success", grievances: result.rows });
  } catch (error) {
    next(error);
  }
};

// 2. Save grievance
const createGrievance = async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const district = String(body.district || "").trim();
  const category = String(body.category || "").trim();
  const subject = String(body.subject || "").trim();
  const description = String(body.description || "").trim();
  const citizenId = req.user.id; // From authenticate middleware

  const missingFields = [];
  if (!district) missingFields.push("district");
  if (!category) missingFields.push("category");
  if (!subject) missingFields.push("subject");
  if (!description) missingFields.push("description");

  if (missingFields.length) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const referenceNumber = `KL-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO grievances (reference_number, citizen_id, district, category, subject, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, reference_number, district, category, subject, description, status, created_at`,
      [referenceNumber, citizenId, district, category, subject, description]
    );

    res.status(201).json({
      status: "success",
      message: "Grievance submitted successfully",
      grievance: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDistricts, getGrievances, createGrievance };
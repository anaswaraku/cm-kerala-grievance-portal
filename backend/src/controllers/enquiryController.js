"use strict";

const pool = require("../config/db");

// ============================================================
// POST /api/enquiries (public contact form)
// ============================================================
const submitEnquiry = async (req, res, next) => {
  const { name, email, subject, message } = req.body || {};

  const missing = [];
  if (!name || !String(name).trim()) missing.push("name");
  if (!email || !String(email).trim()) missing.push("email");
  if (!subject || !String(subject).trim()) missing.push("subject");
  if (!message || !String(message).trim()) missing.push("message");

  if (missing.length) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_enquiries (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, created_at`,
      [name.trim(), email.trim(), subject.trim(), message.trim()]
    );

    res.status(201).json({
      status: "success",
      message: "Your message has been submitted. We will get back to you shortly.",
      enquiry: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitEnquiry };


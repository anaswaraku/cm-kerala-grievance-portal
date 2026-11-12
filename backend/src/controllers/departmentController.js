const pool = require("../config/db");

const getDepartments = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, contact_email, contact_phone
      FROM departments
      WHERE is_active = TRUE
      ORDER BY name
    `);

    res.json({
      status: "success",
      departments: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDepartments };
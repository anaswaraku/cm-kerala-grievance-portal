const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Kerala CM Grievance Portal API is running",
  });
});
// Test PostgreSQL connection
app.get("/api/db-check", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, NOW() AS time"
        );

        res.json({
            status: "success",
            message: "PostgreSQL connected successfully!",
            database: result.rows[0].database,
            serverTime: result.rows[0].time
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            status: "error",
            message: "PostgreSQL connection failed"
        });
    }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Unhandled request error:", error.message);
  res.status(500).json({ message: "An unexpected server error occurred" });
});
app.get("/api/departments", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, contact_email, contact_phone
       FROM departments
       WHERE is_active = TRUE
       ORDER BY name`,
    );

    res.json({
      status: "success",
      departments: result.rows,
    });
  } catch (error) {
    console.error("Department retrieval error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Could not retrieve departments",
    });
  }
});
// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

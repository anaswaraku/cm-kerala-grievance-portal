const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const statsRoutes = require("./routes/statsRoutes");

const pool = require("./config/db");

const app = express();

app.use(
  cors({
    origin: ["https://cm-kerala-grievance-portal-steel.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (local development only;
// use persistent object storage in production)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Kerala CM Grievance Portal API is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Database check
app.get("/api/db-check", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS time",
    );

    res.json({
      status: "success",
      message: "PostgreSQL connected successfully!",
      database: result.rows[0].database,
      serverTime: result.rows[0].time,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      status: "error",
      message: "PostgreSQL connection failed",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled request error:", error);

  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
});

module.exports = app;

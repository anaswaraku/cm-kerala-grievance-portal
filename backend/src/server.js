const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["https://cm-kerala-grievance-portal-bay.vercel.app/"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/stats", statsRoutes);

// Health check / Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Kerala CM Grievance Portal API is running",
    version: "1.0.0",
  });
});

// Test PostgreSQL connection
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
    console.error("Database error:", error.message);
    res.status(500).json({
      status: "error",
      message: "PostgreSQL connection failed",
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Unhandled request error:", error);
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "An unexpected server error occurred",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

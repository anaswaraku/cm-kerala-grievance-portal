"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
  getDistricts,
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
} = require("../controllers/grievanceController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = express.Router();

// Public routes
router.get("/districts", getDistricts);
router.get("/track/:ref", trackGrievance);

// Citizen routes
router.get("/my", authenticate, authorize("citizen"), getMyCitizenGrievances);
router.post("/", authenticate, authorize("citizen"), createGrievance);
router.post("/:id/attachments", authenticate, authorize("citizen"), upload.single("file"), uploadAttachment);
router.post("/:id/feedback", authenticate, authorize("citizen"), submitFeedback);

// CMO & Officer routes
router.get("/counts", authenticate, authorize("cmo_admin"), getGrievanceCounts);
router.get("/", authenticate, authorize("cmo_admin", "department_officer"), getAllGrievances);
router.get("/:id", authenticate, authorize("cmo_admin", "department_officer"), getGrievanceDetail);
router.patch("/:id/status", authenticate, authorize("cmo_admin", "department_officer"), changeGrievanceStatus);
router.post("/:id/assign", authenticate, authorize("cmo_admin"), assignDepartment);

module.exports = router;

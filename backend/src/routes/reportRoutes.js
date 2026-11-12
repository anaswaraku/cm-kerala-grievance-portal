"use strict";

const express = require("express");
const { submitReport, reviewReport } = require("../controllers/reportController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/", authenticate, authorize("department_officer"), submitReport);
router.patch("/:id/review", authenticate, authorize("cmo_admin"), reviewReport);

module.exports = router;


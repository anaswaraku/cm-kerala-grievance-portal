"use strict";

const express = require("express");
const {
  getPublicStats,
  getDistrictStats,
  getDepartmentStats,
} = require("../controllers/statsController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/", getPublicStats);
router.get("/by-district", authenticate, authorize("cmo_admin"), getDistrictStats);
router.get("/by-department", authenticate, authorize("cmo_admin"), getDepartmentStats);

module.exports = router;


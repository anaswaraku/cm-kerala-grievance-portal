const express = require("express");
const { getDistricts, createGrievance } = require("../controllers/grievanceController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Districts can be public or authenticated
router.get("/districts", getDistricts);

// Grievance submission requires a logged-in citizen
router.post("/", authenticate, authorize("citizen"), createGrievance);

module.exports = router;
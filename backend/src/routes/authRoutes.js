const express = require("express");
const { register, login, me, dashboard } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.get("/dashboard/citizen", authenticate, authorize("citizen"), dashboard("citizen"));
router.get("/dashboard/cmo", authenticate, authorize("cmo_admin"), dashboard("CMO administrator"));
router.get("/dashboard/officer", authenticate, authorize("department_officer"), dashboard("department officer"));

module.exports = router;

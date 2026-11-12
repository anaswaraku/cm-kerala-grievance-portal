"use strict";

const express = require("express");
const { submitEnquiry } = require("../controllers/enquiryController");

const router = express.Router();

router.post("/", submitEnquiry);

module.exports = router;


const express = require("express");
const { getResults } = require("../controllers/resultController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticate(true),
  requireRole(["admin", "voter"]),
  getResults
);

module.exports = router;

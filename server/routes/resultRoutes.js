const express = require("express");
const { getResults } = require("../controllers/resultController");
const { finalizeResults } = require("../controllers/resultController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticate(true),
  requireRole(["admin", "voter"]),
  getResults
);
router.post(
  "/finalize",
  authenticate(true),
  requireRole("admin"),
  finalizeResults
);

module.exports = router;

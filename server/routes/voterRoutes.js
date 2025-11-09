const express = require("express");
const multer = require("multer");
const { registerVoter, loginVoter } = require("../controllers/voterController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/register",
  authenticate(true),
  requireRole("admin"),
  upload.single("image"),
  registerVoter
);

router.post("/login", loginVoter);

module.exports = router;

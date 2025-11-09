const express = require("express");
const {
  loginAdmin,
  getAdminProfile,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", authenticate(true), requireRole("admin"), getAdminProfile);

module.exports = router;

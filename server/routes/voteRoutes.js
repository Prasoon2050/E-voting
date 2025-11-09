const express = require("express");
const multer = require("multer");
const { authenticate, requireRole } = require("../middleware/auth");
const { listCandidates, castVote } = require("../controllers/voteController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/candidates", listCandidates);
router.post(
  "/cast",
  authenticate(true),
  requireRole("voter"),
  upload.single("image"),
  castVote
);

module.exports = router;

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Voter = require("../models/Voter");
const { uploadToS3, getObjectFromS3, compareFaces } = require("../config/aws");
const { generateToken } = require("../middleware/auth");

const FACE_SIMILARITY_THRESHOLD = Number(process.env.FACE_SIMILARITY || 75);

async function generateUniqueVoterId() {
  // Loop until a unique identifier is created; collisions are extremely unlikely
  // but still guarded.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const voterId = crypto.randomBytes(10).toString("hex");
    // eslint-disable-next-line no-await-in-loop
    const exists = await Voter.exists({ voterId });
    if (!exists) {
      return voterId;
    }
  }
}

async function registerVoter(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    const { fullName, aadharNumber, password } = req.body;
    if (!fullName || !aadharNumber || !password) {
      return res.status(400).json({
        error: "fullName, aadharNumber and password are required",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: "Face image (image field) is required" });
    }

    const existingByAadhar = await Voter.findOne({ aadharNumber });
    if (existingByAadhar) {
      return res.status(409).json({ error: "Aadhaar already registered" });
    }

    const voterId = await generateUniqueVoterId();
    const s3Key = `faces/${voterId}.jpg`;
    await uploadToS3(req.file.buffer, s3Key, req.file.mimetype || "image/jpeg");

    const passwordHash = await bcrypt.hash(password, 10);

    const voter = await Voter.create({
      voterId,
      fullName,
      aadharNumber,
      passwordHash,
      s3Key,
      registeredBy: req.user.adminId,
    });

    res.status(201).json({
      message: "Voter registered successfully",
      voter: {
        voterHash: voter.voterId,
        voterId: voter.voterId,
        fullName: voter.fullName,
        aadharNumber: voter.aadharNumber,
        s3Key: voter.s3Key,
      },
    });
  } catch (err) {
    console.error("registerVoter error", err);
    res.status(500).json({ error: "Failed to register voter" });
  }
}

async function loginVoter(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        error: "identifier (voter hash or Aadhaar) and password are required",
      });
    }

    const normalizedId = identifier.trim();
    const voter = await Voter.findOne({
      $or: [{ voterId: normalizedId }, { aadharNumber: normalizedId }],
    });
    if (!voter) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, voter.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      sub: voter._id.toString(),
      role: "voter",
      voterId: voter.voterId,
      fullName: voter.fullName,
    });

    res.json({
      token,
      voter: {
        voterId: voter.voterId,
        fullName: voter.fullName,
        faceVerified: voter.faceVerified,
      },
    });
  } catch (err) {
    console.error("loginVoter error", err);
    res.status(500).json({ error: "Failed to login voter" });
  }
}

async function verifyVoterFace(voterId, incomingBuffer) {
  const voter = await Voter.findOne({ voterId });
  if (!voter || !voter.s3Key) {
    throw new Error("Voter face enrollment not found");
  }

  const storedImage = await getObjectFromS3(voter.s3Key);
  const compareRes = await compareFaces(
    storedImage,
    incomingBuffer,
    FACE_SIMILARITY_THRESHOLD
  );

  const match = Array.isArray(compareRes.FaceMatches)
    ? compareRes.FaceMatches[0]
    : null;
  if (!match) {
    return { voter, isMatch: false, similarity: 0 };
  }

  voter.faceVerified = true;
  voter.lastVerifiedAt = new Date();
  await voter.save();

  return { voter, isMatch: true, similarity: match.Similarity };
}

module.exports = {
  registerVoter,
  loginVoter,
  verifyVoterFace,
};

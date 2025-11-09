const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    aadharNumber: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    s3Key: { type: String, required: true },
    faceVerified: { type: Boolean, default: false },
    lastVerifiedAt: { type: Date },
    registeredBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);

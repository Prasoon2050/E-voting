const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    candidateId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    party: { type: String },
    manifesto: { type: String },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);

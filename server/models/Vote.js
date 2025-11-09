const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true },
    faceSimilarity: { type: Number },
    castAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);

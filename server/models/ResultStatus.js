const mongoose = require("mongoose");

const resultStatusSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "global" },
    status: {
      type: String,
      enum: ["pending", "published"],
      default: "pending",
    },
    publishedAt: { type: Date },
    totalVotes: { type: Number, default: 0 },
    results: [
      {
        candidateId: String,
        name: String,
        party: String,
        votes: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResultStatus", resultStatusSchema);

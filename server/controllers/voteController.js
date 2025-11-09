const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const ResultStatus = require("../models/ResultStatus");
const { getContract } = require("../config/fabric-connection");
const { verifyVoterFace } = require("./voterController");

async function listCandidates(req, res) {
  try {
    const candidates = await Candidate.find({}, { _id: 0, __v: 0 }).sort({
      candidateId: 1,
    });
    res.json({ candidates });
  } catch (err) {
    console.error("listCandidates error", err);
    res.status(500).json({ error: "Failed to load candidates" });
  }
}

async function castVote(req, res) {
  try {
    if (!req.user || req.user.role !== "voter") {
      return res.status(403).json({ error: "Voter authentication required" });
    }

    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Live face image is required" });
    }

    const candidate = await Candidate.findOne({ candidateId });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const resultState = await ResultStatus.findById("global");
    if (resultState && resultState.status === "published") {
      return res
        .status(400)
        .json({ error: "Voting has closed. Results already published." });
    }

    const existingVote = await Vote.findOne({ voterId: req.user.voterId });
    if (existingVote) {
      return res.status(409).json({ error: "Vote already cast" });
    }

    const { isMatch, similarity } = await verifyVoterFace(
      req.user.voterId,
      req.file.buffer
    );

    if (!isMatch) {
      return res.status(401).json({ error: "Face verification failed" });
    }

    let gateway;
    let ledgerResponse;
    try {
      const { contract, gateway: gw } = await getContract();
      gateway = gw;
      const resultBuffer = await contract.submitTransaction(
        "CastVote",
        candidateId
      );
      ledgerResponse = JSON.parse(resultBuffer.toString());
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }

    const vote = await Vote.create({
      voterId: req.user.voterId,
      faceSimilarity: similarity,
    });

    res.json({
      message: "Vote recorded successfully",
      ledger: ledgerResponse,
      vote: {
        voterId: vote.voterId,
        faceSimilarity: vote.faceSimilarity,
      },
    });
  } catch (err) {
    console.error("castVote error", err);
    res.status(500).json({ error: "Failed to cast vote" });
  }
}

module.exports = {
  listCandidates,
  castVote,
};

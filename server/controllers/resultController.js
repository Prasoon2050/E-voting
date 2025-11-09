const Candidate = require("../models/Candidate");
const ResultStatus = require("../models/ResultStatus");
const { getContract } = require("../config/fabric-connection");

async function getResults(req, res) {
  try {
    const state = await ResultStatus.findById("global").lean();
    if (!state || state.status !== "published") {
      return res.json({
        status: "pending",
        message: "Vote counting not started",
      });
    }

    res.json({
      status: "published",
      publishedAt: state.publishedAt,
      totalVotes: state.totalVotes,
      results: state.results,
    });
  } catch (err) {
    console.error("getResults error", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
}

async function finalizeResults(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    let gateway;
    let ledgerData;
    try {
      const { contract, gateway: gw } = await getContract();
      gateway = gw;
      const buffer = await contract.evaluateTransaction("GetResults");
      ledgerData = JSON.parse(buffer.toString());
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }

    const candidates = await Candidate.find({}, { _id: 0, __v: 0 }).lean();
    const voteMap = new Map();
    if (ledgerData && Array.isArray(ledgerData.candidates)) {
      for (const entry of ledgerData.candidates) {
        voteMap.set(
          entry.ID || entry.id || entry.candidateId,
          entry.Votes || entry.votes || 0
        );
      }
    }

    const results = candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      name: candidate.name,
      party: candidate.party,
      votes: voteMap.get(candidate.candidateId) || 0,
    }));

    const totalVotes =
      typeof ledgerData?.totalVotes === "number"
        ? ledgerData.totalVotes
        : results.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);

    const publishedAt = new Date();
    const state = await ResultStatus.findByIdAndUpdate(
      "global",
      {
        status: "published",
        publishedAt,
        totalVotes,
        results,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      status: state.status,
      publishedAt: state.publishedAt,
      totalVotes: state.totalVotes,
      results: state.results,
    });
  } catch (err) {
    console.error("finalizeResults error", err);
    res.status(500).json({ error: "Failed to finalize results" });
  }
}

module.exports = { getResults, finalizeResults };

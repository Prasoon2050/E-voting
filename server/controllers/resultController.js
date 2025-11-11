const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");

async function getResults(req, res) {
  try {
    const [counts, candidates] = await Promise.all([
      Vote.aggregate([
        {
          $group: {
            _id: "$candidateId",
            votes: { $sum: 1 },
          },
        },
      ]),
      Candidate.find({}, { _id: 0, __v: 0 }).lean(),
    ]);

    const countMap = counts.reduce((acc, entry) => {
      acc[entry._id] = entry.votes;
      return acc;
    }, {});

    const results = candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      name: candidate.name,
      party: candidate.party,
      votes: countMap[candidate.candidateId] || 0,
    }));

    res.json({ results });
  } catch (err) {
    console.error("getResults error", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
}

module.exports = { getResults };

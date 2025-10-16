"use strict";

const { Contract } = require("fabric-contract-api");

class EvoteContract extends Contract {
  async InitLedger(ctx) {
    // Optional: seed with example candidates
    const candidates = [
      { ID: "C1", Name: "Alice", Votes: 0 },
      { ID: "C2", Name: "Bob", Votes: 0 },
    ];
    for (const cand of candidates) {
      await ctx.stub.putState(
        "CAND_" + cand.ID,
        Buffer.from(JSON.stringify(cand))
      );
    }
    return "Ledger initialized";
  }

  // Register a candidate: stores {ID, Name, Votes}
  async RegisterCandidate(ctx, id, name) {
    if (!id || !name) {
      throw new Error("RegisterCandidate requires id and name");
    }
    const key = "CAND_" + id;
    const exists = await this._exists(ctx, key);
    if (exists) {
      throw new Error(`Candidate ${id} already exists`);
    }
    const candidate = { ID: id, Name: name, Votes: 0 };
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(candidate)));
    return JSON.stringify(candidate);
  }

  // Register a voter: stores {ID, Voted}
  async RegisterVoter(ctx, id) {
    if (!id) {
      throw new Error("RegisterVoter requires id");
    }
    const key = "VOTER_" + id;
    const exists = await this._exists(ctx, key);
    if (exists) {
      throw new Error(`Voter ${id} already exists`);
    }
    const voter = { ID: id, Voted: false };
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(voter)));
    return JSON.stringify(voter);
  }

  // Cast a vote: checks voter exists & hasn't voted, candidate exists, increments votes, marks voter as voted
  async CastVote(ctx, voterId, candidateId) {
    if (!voterId || !candidateId) {
      throw new Error("CastVote requires voterId and candidateId");
    }

    const voterKey = "VOTER_" + voterId;
    const candKey = "CAND_" + candidateId;

    const voterBytes = await ctx.stub.getState(voterKey);
    if (!voterBytes || voterBytes.length === 0) {
      throw new Error(`Voter ${voterId} not found`);
    }
    const voter = JSON.parse(voterBytes.toString());
    if (voter.Voted) {
      throw new Error(`Voter ${voterId} has already voted`);
    }

    const candBytes = await ctx.stub.getState(candKey);
    if (!candBytes || candBytes.length === 0) {
      throw new Error(`Candidate ${candidateId} not found`);
    }
    const candidate = JSON.parse(candBytes.toString());

    // Update candidate votes
    candidate.Votes = parseInt(candidate.Votes) + 1;
    await ctx.stub.putState(candKey, Buffer.from(JSON.stringify(candidate)));

    // Mark voter as voted
    voter.Voted = true;
    await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voter)));

    // Emit an event for off-chain listeners (optional)
    const eventPayload = {
      voterId,
      candidateId,
      timestamp: new Date().toISOString(),
    };
    ctx.stub.setEvent("VoteCast", Buffer.from(JSON.stringify(eventPayload)));

    return JSON.stringify({
      success: true,
      voter: voterId,
      candidate: candidateId,
    });
  }

  // Query results: return all candidates with vote counts
  async QueryResults(ctx) {
    const iterator = await ctx.stub.getStateByRange("CAND_", "CAND_￿");
    const results = [];
    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const record = JSON.parse(res.value.value.toString("utf8"));
        results.push(record);
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }
    return JSON.stringify(results);
  }

  // Query a single candidate
  async QueryCandidate(ctx, id) {
    if (!id) throw new Error("QueryCandidate requires id");
    const key = "CAND_" + id;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Candidate ${id} not found`);
    }
    return bytes.toString();
  }

  // Query a single voter
  async QueryVoter(ctx, id) {
    if (!id) throw new Error("QueryVoter requires id");
    const key = "VOTER_" + id;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Voter ${id} not found`);
    }
    return bytes.toString();
  }

  // helper: check existence
  async _exists(ctx, key) {
    const data = await ctx.stub.getState(key);
    return !!data && data.length > 0;
  }
}

module.exports = EvoteContract;

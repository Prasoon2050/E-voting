"use strict";

const { Contract } = require("fabric-contract-api");

class EvoteContract extends Contract {
  async InitLedger(ctx) {
    await ctx.stub.putState("TOTAL_VOTES", Buffer.from("0"));
    return "Ledger initialized";
  }

  async RegisterCandidate(ctx, id, name, party = "") {
    if (!id || !name) {
      throw new Error("RegisterCandidate requires id and name");
    }
    const key = this._candidateKey(id);
    const exists = await this._exists(ctx, key);
    if (exists) {
      throw new Error(`Candidate ${id} already exists`);
    }
    const candidate = { ID: id, Name: name, Party: party, Votes: 0 };
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(candidate)));
    return JSON.stringify(candidate);
  }

  async CastVote(ctx, candidateId) {
    if (!candidateId) {
      throw new Error("CastVote requires candidateId");
    }

    const key = this._candidateKey(candidateId);
    const candBytes = await ctx.stub.getState(key);
    if (!candBytes || candBytes.length === 0) {
      throw new Error(`Candidate ${candidateId} not found`);
    }

    const candidate = JSON.parse(candBytes.toString());
    const currentVotes = parseInt(candidate.Votes || 0, 10);
    candidate.Votes = currentVotes + 1;
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(candidate)));

    const totalVotes = (await this._getTotalVotes(ctx)) + 1;
    await ctx.stub.putState("TOTAL_VOTES", Buffer.from(totalVotes.toString()));

    const eventPayload = {
      candidateId,
      votes: candidate.Votes,
      totalVotes,
      timestamp: new Date().toISOString(),
    };
    ctx.stub.setEvent("VoteCast", Buffer.from(JSON.stringify(eventPayload)));

    return JSON.stringify({
      candidateId,
      votes: candidate.Votes,
      totalVotes,
    });
  }

  async QueryResults(ctx) {
    return this.GetResults(ctx);
  }

  async GetResults(ctx) {
    const iterator = await ctx.stub.getStateByRange("CAND_", "CAND_￿");
    const candidates = [];
    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const record = JSON.parse(res.value.value.toString("utf8"));
        candidates.push(record);
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    const totalVotes = await this._getTotalVotes(ctx);
    return JSON.stringify({ candidates, totalVotes });
  }

  async QueryCandidate(ctx, id) {
    if (!id) throw new Error("QueryCandidate requires id");
    const key = this._candidateKey(id);
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Candidate ${id} not found`);
    }
    return bytes.toString();
  }

  _candidateKey(id) {
    return "CAND_" + id;
  }

  async _getTotalVotes(ctx) {
    const bytes = await ctx.stub.getState("TOTAL_VOTES");
    if (!bytes || bytes.length === 0) {
      return 0;
    }
    const asNumber = parseInt(bytes.toString(), 10);
    return Number.isNaN(asNumber) ? 0 : asNumber;
  }

  async _exists(ctx, key) {
    const data = await ctx.stub.getState(key);
    return !!data && data.length > 0;
  }
}

module.exports = EvoteContract;

"use strict";

const { getContract } = require("../config/fabric-connection");

exports.registerVoter = async (req, res) => {
  const { voterId } = req.body;
  if (!voterId) return res.status(400).json({ error: "voterId required" });
  let gw;
  try {
    const result = await getContract();
    const contract = result.contract;
    gw = result.gateway;

    await contract.submitTransaction("RegisterVoter", voterId);
    res.json({
      success: true,
      message: `Voter ${voterId} registered on ledger`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (gw) gw.disconnect();
  }
};

exports.castVote = async (req, res) => {
  const { voterId, candidateId } = req.body;
  if (!voterId || !candidateId)
    return res.status(400).json({ error: "voterId and candidateId required" });
  let gw;
  try {
    const result = await getContract(voterId);
    const contract = result.contract;
    gw = result.gateway;

    // Submit CastVote transaction -- assumes identity for voterId exists in wallet
    await contract.submitTransaction("CastVote", voterId, candidateId);
    res.json({ success: true, message: "Vote cast successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (gw) gw.disconnect();
  }
};

exports.queryResults = async (req, res) => {
  let gw;
  try {
    const result = await getContract();
    const contract = result.contract;
    gw = result.gateway;

    const evalResult = await contract.evaluateTransaction("QueryResults");
    const results = JSON.parse(evalResult.toString());
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (gw) gw.disconnect();
  }
};

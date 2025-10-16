"use strict";

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function getContract(identity = "appUser") {
  // adjust these paths relative to server/config
  const ccpPath = path.resolve(
    __dirname,
    "../../blockchain/network/connection-org1.json"
  );
  const ccpJSON = fs.readFileSync(ccpPath, "utf8");
  const ccp = JSON.parse(ccpJSON);

  const walletPath = path.resolve(
    __dirname,
    "../../blockchain/network/wallets"
  );
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity,
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork("evotechannel");
  const contract = network.getContract("evote");

  // return both contract and gateway so caller can disconnect when done
  return { contract, gateway };
}

module.exports = { getContract };

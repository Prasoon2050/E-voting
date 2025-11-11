const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Candidate = require("../models/Candidate");

const defaultAdmins = [
  {
    adminId: "admin-001",
    name: "Election Officer Alpha",
    email: "alpha@evote.local",
    password: "AlphaSecure#2025",
  },
  {
    adminId: "admin-002",
    name: "Election Officer Bravo",
    email: "bravo@evote.local",
    password: "BravoSecure#2025",
  },
  {
    adminId: "admin-003",
    name: "Election Officer Charlie",
    email: "charlie@evote.local",
    password: "CharlieSecure#2025",
  },
];

const defaultCandidates = [
  { candidateId: "C1", name: "Alice Johnson", party: "Progress Alliance" },
  { candidateId: "C2", name: "Bob Smith", party: "Unity Front" },
  { candidateId: "C3", name: "Chen Lee", party: "Future Now" },
];

async function ensureAdmins() {
  for (const admin of defaultAdmins) {
    const existing = await Admin.findOne({ adminId: admin.adminId });
    if (existing) continue;

    const passwordHash = await bcrypt.hash(admin.password, 10);
    await Admin.create({
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      passwordHash,
      roles: ["admin"],
    });
    console.log(`Seeded admin ${admin.adminId}`);
  }
}

async function ensureCandidates() {
  for (const candidate of defaultCandidates) {
    const existing = await Candidate.findOne({
      candidateId: candidate.candidateId,
    });
    if (existing) continue;
    await Candidate.create(candidate);
    console.log(`Seeded candidate ${candidate.candidateId}`);
  }
}

async function seedInitialData() {
  await ensureAdmins();
  await ensureCandidates();
}

module.exports = { seedInitialData, defaultAdmins };

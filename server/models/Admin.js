const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ["admin"] },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

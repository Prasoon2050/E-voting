const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { generateToken } = require("../middleware/auth");

async function loginAdmin(req, res) {
  try {
    const { adminId, email, password } = req.body;
    if ((!adminId && !email) || !password) {
      return res
        .status(400)
        .json({ error: "Provide adminId or email and the password" });
    }

    const admin = await Admin.findOne(
      adminId ? { adminId } : { email: email?.toLowerCase() }
    );

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken({
      sub: admin._id.toString(),
      role: "admin",
      adminId: admin.adminId,
      name: admin.name,
    });

    res.json({
      token,
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (err) {
    console.error("loginAdmin error", err);
    res.status(500).json({ error: "Failed to login admin" });
  }
}

async function getAdminProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const admin = await Admin.findOne({ adminId: req.user.adminId }).lean();
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (err) {
    console.error("getAdminProfile error", err);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
}

module.exports = {
  loginAdmin,
  getAdminProfile,
};

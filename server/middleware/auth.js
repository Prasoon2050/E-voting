const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function generateToken(payload, options = {}) {
  const defaultOptions = { expiresIn: "2h" };
  return jwt.sign(payload, JWT_SECRET, { ...defaultOptions, ...options });
}

function authenticate(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      if (required) {
        return res.status(401).json({ error: "Authentication required" });
      }
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.error("JWT verification failed", err);
      if (required) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      req.user = null;
      return next();
    }
  };
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    return next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticate,
  requireRole,
};

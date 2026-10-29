const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// A JWT can't be revoked directly, so every authenticated request checks
// the account's current deactivated/session-invalidated state in the DB —
// this is what makes deactivation and "log out everywhere" (on password
// change) take effect immediately instead of waiting for the token to expire.
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "deactivatedAt sessionsInvalidatedAt"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (user.deactivatedAt) {
      return res.status(403).json({
        message: "This account has been deactivated.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    if (
      user.sessionsInvalidatedAt &&
      decoded.iat * 1000 < user.sessionsInvalidatedAt.getTime()
    ) {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }

    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

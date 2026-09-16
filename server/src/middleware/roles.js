// Role-based access middleware.
// Usage: requireRole("admin", "superadmin") - allows either role through.
// superadmin is treated as having access to everything admins can do,
// but routes that are superadmin-only should list only "superadmin".
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: requires role ${allowedRoles.join(" or ")}.`,
      });
    }
    next();
  };
}

module.exports = { requireRole };

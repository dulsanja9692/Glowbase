const User = require("../models/User");

// GET /api/users  (superadmin only) - manage the team (admins + superadmins)
async function listStaff(req, res) {
  const staff = await User.find({ role: { $in: ["admin", "superadmin"] } }).sort({ createdAt: -1 });
  res.json({ users: staff.map((u) => u.toSafeObject()) });
}

// Note: there is deliberately no "create admin" endpoint here. Sellers
// choose their own email/password by applying at POST /api/seller-requests
// (see sellerRequestController.js); a Super Admin only approves or
// rejects, and never sets or sees anyone else's password.

// PATCH /api/users/:id/role  (superadmin only) - promote/demote between admin <-> superadmin
async function changeRole(req, res) {
  const { role } = req.body;
  if (!["admin", "superadmin"].includes(role)) {
    return res.status(400).json({ message: "Role must be admin or superadmin." });
  }
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot change your own role." });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: user.toSafeObject() });
}

// DELETE /api/users/:id  (superadmin only)
async function removeUser(req, res) {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot remove your own account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ message: "User removed." });
}

module.exports = { listStaff, changeRole, removeUser };

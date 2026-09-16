const User = require("../models/User");
const { signToken } = require("../utils/token");

// POST /api/auth/register  - always creates a "user" (customer).
// Admin/superadmin accounts are created by an existing superadmin via
// the userController, not through public registration.
async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "An account with this email already exists." });

  const user = await User.create({ name, email, password, role: "user" });
  const token = signToken(user);
  res.status(201).json({ token, user: user.toSafeObject() });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: "This account has been disabled." });
  }

  const token = signToken(user);
  res.json({ token, user: user.toSafeObject() });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

module.exports = { register, login, me };

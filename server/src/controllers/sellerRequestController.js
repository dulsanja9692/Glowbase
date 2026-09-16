const SellerRequest = require("../models/SellerRequest");
const User = require("../models/User");

// POST /api/seller-requests  (public) - a prospective seller applies.
// They choose their own email + password here; nothing is created by
// a Super Admin on their behalf. The account only becomes real once
// a Super Admin approves the request.
async function apply(req, res) {
  const { name, email, password, businessName, message } = req.body;
  if (!name || !email || !password || !businessName) {
    return res.status(400).json({ message: "Name, email, password and business name are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });

  const existingRequest = await SellerRequest.findOne({ email: normalizedEmail, status: "pending" });
  if (existingRequest) return res.status(409).json({ message: "You already have a pending application with this email." });

  await SellerRequest.create({ name, email: normalizedEmail, password, businessName, message });
  res.status(201).json({ message: "Application submitted. A Super Admin will review it shortly." });
}

// GET /api/seller-requests  (superadmin only) - the review queue.
async function listRequests(req, res) {
  const requests = await SellerRequest.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json({ requests });
}

// PATCH /api/seller-requests/:id/approve  (superadmin only)
// Creates the real admin account using the applicant's own credentials,
// then removes the request record entirely.
async function approve(req, res) {
  const request = await SellerRequest.findById(req.params.id).select("+password");
  if (!request) return res.status(404).json({ message: "Request not found." });

  const existingUser = await User.findOne({ email: request.email });
  if (existingUser) {
    await request.deleteOne();
    return res.status(409).json({ message: "An account with this email was already created." });
  }

  // request.password is already bcrypt-hashed (see SellerRequest's pre-save
  // hook). We insert it directly and skip User's own hashing hook, which
  // would otherwise hash an already-hashed value and break the applicant's
  // login (see User.js: $locals.skipPasswordHash).
  const user = new User({ name: request.name, email: request.email, role: "admin" });
  user.password = request.password;
  user.$locals.skipPasswordHash = true;
  await user.save();

  await request.deleteOne();
  res.json({ message: "Seller approved.", user: user.toSafeObject() });
}

// PATCH /api/seller-requests/:id/reject  (superadmin only)
async function reject(req, res) {
  const request = await SellerRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });
  await request.deleteOne();
  res.json({ message: "Application rejected." });
}

module.exports = { apply, listRequests, approve, reject };

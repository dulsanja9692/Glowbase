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
  const existingUser = await User.findByEmail(normalizedEmail);
  if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });

  const existingRequest = await SellerRequest.findPendingByEmail(normalizedEmail);
  if (existingRequest) return res.status(409).json({ message: "You already have a pending application with this email." });

  await SellerRequest.createRequest({ name, email: normalizedEmail, password, businessName, message });
  res.status(201).json({ message: "Application submitted. A Super Admin will review it shortly." });
}

// GET /api/seller-requests  (superadmin only) - the review queue.
async function listRequests(req, res) {
  const requests = await SellerRequest.findPending();
  res.json({ requests });
}

// PATCH /api/seller-requests/:id/approve  (superadmin only)
// Creates the real admin account using the applicant's own credentials,
// then removes the request record entirely.
async function approve(req, res) {
  const request = await SellerRequest.findById(req.params.id, { includePassword: true });
  if (!request) return res.status(404).json({ message: "Request not found." });

  const existingUser = await User.findByEmail(request.email);
  if (existingUser) {
    await SellerRequest.deleteById(req.params.id);
    return res.status(409).json({ message: "An account with this email was already created." });
  }

  // request.password is already bcrypt-hashed (done in SellerRequest.createRequest).
  // We insert it directly with skipHash=true so it doesn't get double-hashed.
  const user = await User.createUser({
    name: request.name,
    email: request.email,
    password: request.password,
    role: "admin",
    skipHash: true,
  });

  await SellerRequest.deleteById(req.params.id);
  res.json({ message: "Seller approved.", user: User.toSafeObject(user) });
}

// PATCH /api/seller-requests/:id/reject  (superadmin only)
async function reject(req, res) {
  const request = await SellerRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });
  await SellerRequest.deleteById(req.params.id);
  res.json({ message: "Application rejected." });
}

module.exports = { apply, listRequests, approve, reject };

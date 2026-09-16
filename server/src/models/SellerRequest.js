const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// A prospective seller's application to become an Admin. The applicant
// sets their own name/email/password here (never typed by a Super
// Admin). On approval, a real User with role "admin" is created using
// these exact credentials; on approval or rejection, the request is
// deleted so a plaintext-adjacent password is never kept around longer
// than the review window (see sellerRequestController.js).
const sellerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    businessName: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

sellerRequestSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("SellerRequest", sellerRequestSchema);

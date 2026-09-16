const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    // Three-tier role system:
    //  - user: customer, can browse & purchase
    //  - admin: seller, can manage their own products + view/update orders
    //  - superadmin: full control incl. managing admins/users + analytics
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    avatarUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Used by sellerRequestController when promoting an approved
  // SellerRequest into a real User: that password is already bcrypt-hashed
  // (hashed once, at application time), so re-hashing it here would hash
  // it a second time and permanently lock the new admin out of their own
  // account. Set user.$locals.skipPasswordHash = true before .save() to
  // insert a pre-hashed value as-is.
  if (this.$locals.skipPasswordHash) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);

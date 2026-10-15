const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");

const COLLECTION = "users";
const usersRef = db.collection(COLLECTION);

function formatUserDoc(doc, { includePassword = false } = {}) {
  if (!doc) return null;
  const data = typeof doc.data === "function" ? doc.data() : doc;
  const id = doc.id || data.id || data._id;
  const user = { id, _id: id, ...data };
  if (!includePassword) delete user.password;
  return user;
}

/**
 * Create a new user document. Hashes the password unless skipHash is true.
 * Returns the user object with `id` and `_id` fields.
 */
async function createUser({ name, email, password, role = "user", avatarUrl = "", address = "", phone = "", isActive = true, skipHash = false }) {
  if (!skipHash) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
  }

  const data = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role,
    avatarUrl,
    address,
    phone,
    isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await usersRef.add(data);
  return formatUserDoc({ id: docRef.id, ...data }, { includePassword: false });
}

/**
 * Find a user by email. Optionally include the password field.
 */
async function findByEmail(email, { includePassword = false } = {}) {
  const snap = await usersRef.where("email", "==", email.toLowerCase().trim()).limit(1).get();
  if (snap.empty) return null;
  return formatUserDoc(snap.docs[0], { includePassword });
}

/**
 * Find a user by document ID. Password is excluded by default.
 */
async function findById(id, { includePassword = false } = {}) {
  const doc = await usersRef.doc(id).get();
  if (!doc.exists) return null;
  return formatUserDoc(doc, { includePassword });
}

/**
 * Compare a plaintext candidate with a bcrypt-hashed password.
 */
async function comparePassword(candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
}

/**
 * Return a safe (no password) representation of a user object.
 */
function toSafeObject(user) {
  const id = user.id || user._id;
  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || "",
    address: user.address || "",
    phone: user.phone || "",
    createdAt: user.createdAt,
  };
}

/**
 * Find users by roles (array). Returns safe objects.
 */
async function findByRoles(roles) {
  const snap = await usersRef.where("role", "in", roles).get();
  const list = snap.docs.map((doc) => formatUserDoc(doc, { includePassword: false }));
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Update a user document by ID. Returns the updated user.
 */
async function updateById(id, updates) {
  updates.updatedAt = new Date().toISOString();
  await usersRef.doc(id).update(updates);
  return findById(id);
}

/**
 * Delete a user document by ID.
 */
async function deleteById(id) {
  const user = await findById(id);
  if (!user) return null;
  await usersRef.doc(id).delete();
  return user;
}

/**
 * Delete all user documents (used by seed).
 */
async function deleteAll() {
  const snap = await usersRef.get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  comparePassword,
  toSafeObject,
  findByRoles,
  updateById,
  deleteById,
  deleteAll,
};

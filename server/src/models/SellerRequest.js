const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");

const COLLECTION = "sellerRequests";
const requestsRef = db.collection(COLLECTION);

function formatRequestDoc(doc, { includePassword = false } = {}) {
  if (!doc) return null;
  const data = typeof doc.data === "function" ? doc.data() : doc;
  const id = doc.id || data.id || data._id;
  const req = { id, _id: id, ...data };
  if (!includePassword) delete req.password;
  return req;
}

/**
 * Create a new seller request. Hashes the password before storing.
 */
async function createRequest({ name, email, password, businessName, message = "" }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const data = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    businessName: businessName.trim(),
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await requestsRef.add(data);
  return formatRequestDoc({ id: docRef.id, ...data });
}

/**
 * Find pending requests.
 */
async function findPending() {
  const snap = await requestsRef.where("status", "==", "pending").get();
  const list = snap.docs.map((doc) => formatRequestDoc(doc, { includePassword: false }));
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Find a request by ID. Optionally include password.
 */
async function findById(id, { includePassword = false } = {}) {
  const doc = await requestsRef.doc(id).get();
  if (!doc.exists) return null;
  return formatRequestDoc(doc, { includePassword });
}

/**
 * Find a pending request by email.
 */
async function findPendingByEmail(email) {
  const snap = await requestsRef
    .where("email", "==", email.toLowerCase().trim())
    .where("status", "==", "pending")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return formatRequestDoc(snap.docs[0]);
}

/**
 * Delete a request by ID.
 */
async function deleteById(id) {
  await requestsRef.doc(id).delete();
}

/**
 * Delete all requests (used by seed).
 */
async function deleteAll() {
  const snap = await requestsRef.get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

module.exports = {
  createRequest,
  findPending,
  findById,
  findPendingByEmail,
  deleteById,
  deleteAll,
};

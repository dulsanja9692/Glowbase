const { db } = require("../config/firebase");

const COLLECTION = "orders";
const ordersRef = db.collection(COLLECTION);

function formatOrderDoc(doc) {
  if (!doc) return null;
  const data = typeof doc.data === "function" ? doc.data() : doc;
  const id = doc.id || data.id || data._id;
  return { id, _id: id, ...data };
}

/**
 * Create a new order document.
 */
async function createOrder({ customer, items, total, shippingAddress = "", payment }) {
  const data = {
    customer, // user document ID
    items,    // array of { product, name, price, quantity }
    total: Number(total),
    status: "Processing",
    payment: payment || { method: "mock-card", status: "pending", reference: "" },
    shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await ordersRef.add(data);
  return formatOrderDoc({ id: docRef.id, ...data });
}

/**
 * Find orders by customer ID.
 */
async function findByCustomer(customerId) {
  const snap = await ordersRef.where("customer", "==", customerId).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => formatOrderDoc(doc));
}

/**
 * Find all orders (admin view).
 */
async function findAll() {
  const snap = await ordersRef.orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => formatOrderDoc(doc));
}

/**
 * Find an order by document ID.
 */
async function findById(id) {
  const doc = await ordersRef.doc(id).get();
  if (!doc.exists) return null;
  return formatOrderDoc(doc);
}

/**
 * Update an order's status.
 */
async function updateStatus(id, status) {
  await ordersRef.doc(id).update({ status, updatedAt: new Date().toISOString() });
  return findById(id);
}

/**
 * Delete all orders (used by seed).
 */
async function deleteAll() {
  const snap = await ordersRef.get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

module.exports = {
  createOrder,
  findByCustomer,
  findAll,
  findById,
  updateStatus,
  deleteAll,
};

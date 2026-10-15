const { db } = require("../config/firebase");

const COLLECTION = "products";
const productsRef = db.collection(COLLECTION);

function formatProductDoc(doc) {
  if (!doc) return null;
  const data = typeof doc.data === "function" ? doc.data() : doc;
  const id = doc.id || data.id || data._id;
  return { id, _id: id, ...data };
}

/**
 * Create a new product document.
 */
async function createProduct({ name, category, price, stock = 0, imageUrl, description = "", rating = 5, seller }) {
  const data = {
    name: name.trim(),
    category,
    price: Number(price),
    stock: Number(stock),
    imageUrl,
    description,
    rating: Number(rating),
    seller, // user document ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await productsRef.add(data);
  return formatProductDoc({ id: docRef.id, ...data });
}

/**
 * Create multiple products at once (used by seed).
 */
async function insertMany(items) {
  const batch = db.batch();
  const results = [];
  for (const item of items) {
    const data = {
      name: item.name,
      category: item.category,
      price: Number(item.price),
      stock: Number(item.stock || 0),
      imageUrl: item.imageUrl,
      description: item.description || "",
      rating: item.rating || 5,
      seller: item.seller,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = productsRef.doc();
    batch.set(ref, data);
    results.push(formatProductDoc({ id: ref.id, ...data }));
  }
  await batch.commit();
  return results;
}

/**
 * Find all products, optionally filtered by category.
 */
async function findAll(filter = {}) {
  let query = productsRef.orderBy("createdAt", "desc");
  if (filter.category) {
    query = productsRef.where("category", "==", filter.category).orderBy("createdAt", "desc");
  }
  const snap = await query.get();
  return snap.docs.map((doc) => formatProductDoc(doc));
}

/**
 * Find products by seller ID.
 */
async function findBySeller(sellerId) {
  const snap = await productsRef.where("seller", "==", sellerId).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => formatProductDoc(doc));
}

/**
 * Find a product by document ID.
 */
async function findById(id) {
  const doc = await productsRef.doc(id).get();
  if (!doc.exists) return null;
  return formatProductDoc(doc);
}

/**
 * Update a product document by ID.
 */
async function updateById(id, updates) {
  updates.updatedAt = new Date().toISOString();
  await productsRef.doc(id).update(updates);
  return findById(id);
}

/**
 * Delete a product document by ID.
 */
async function deleteById(id) {
  const product = await findById(id);
  if (!product) return null;
  await productsRef.doc(id).delete();
  return product;
}

/**
 * Delete all products (used by seed).
 */
async function deleteAll() {
  const snap = await productsRef.get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

module.exports = {
  createProduct,
  insertMany,
  findAll,
  findBySeller,
  findById,
  updateById,
  deleteById,
  deleteAll,
};

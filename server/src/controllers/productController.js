const Product = require("../models/Product");
const User = require("../models/User");

// GET /api/products  (public) - supports ?category=Hair
async function listProducts(req, res) {
  const filter = {};
  if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
  const products = await Product.findAll(filter);

  // Populate seller info
  const populated = await populateSeller(products);
  res.json({ products: populated });
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  // Populate seller
  const seller = await User.findById(product.seller);
  product.seller = seller ? { _id: seller.id, id: seller.id, name: seller.name, role: seller.role } : null;
  res.json({ product });
}

// POST /api/products  (admin, superadmin) - admins are sellers here.
// If an image file was uploaded via multer it takes priority over imageUrl in the body.
async function createProduct(req, res) {
  const { name, category, price, stock, description, imageUrl } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: "name, category and price are required." });
  }

  const finalImage = req.file ? `/uploads/${req.file.filename}` : imageUrl;
  if (!finalImage) return res.status(400).json({ message: "A product image (file or imageUrl) is required." });

  const userId = req.user.id || req.user._id;
  const product = await Product.createProduct({
    name, category, price, stock: stock || 0, description,
    imageUrl: finalImage,
    seller: userId,
  });
  res.status(201).json({ product });
}

// PATCH /api/products/:id  (admin who owns it, or superadmin)
async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const userId = req.user.id || req.user._id;
  const isOwner = product.seller === userId;
  if (req.user.role !== "superadmin" && !isOwner) {
    return res.status(403).json({ message: "You can only edit your own products." });
  }

  const updates = {};
  const fields = ["name", "category", "price", "stock", "description"];
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
  else if (req.body.imageUrl) updates.imageUrl = req.body.imageUrl;

  const updated = await Product.updateById(req.params.id, updates);
  res.json({ product: updated });
}

// DELETE /api/products/:id  (admin who owns it, or superadmin)
async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const userId = req.user.id || req.user._id;
  const isOwner = product.seller === userId;
  if (req.user.role !== "superadmin" && !isOwner) {
    return res.status(403).json({ message: "You can only delete your own products." });
  }

  await Product.deleteById(req.params.id);
  res.json({ message: "Product deleted." });
}

// GET /api/products/mine  (admin, superadmin)
async function listMine(req, res) {
  const userId = req.user.id || req.user._id;
  const products = await Product.findBySeller(userId);
  const populated = await populateSeller(products);
  res.json({ products: populated });
}

// Helper: attach seller info to an array of products
async function populateSeller(products) {
  // Batch-fetch unique seller IDs
  const sellerIds = [...new Set(products.map((p) => p.seller))];
  const sellerMap = {};
  for (const sid of sellerIds) {
    const seller = await User.findById(sid);
    if (seller) sellerMap[sid] = { _id: seller.id, id: seller.id, name: seller.name, role: seller.role };
  }
  return products.map((p) => ({
    ...p,
    seller: sellerMap[p.seller] || null,
  }));
}

module.exports = { listProducts, listMine, getProduct, createProduct, updateProduct, deleteProduct };

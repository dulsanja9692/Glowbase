const Product = require("../models/Product");

// GET /api/products  (public) - supports ?category=Hair
async function listProducts(req, res) {
  const filter = {};
  if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
  const products = await Product.find(filter).populate("seller", "name role").sort({ createdAt: -1 });
  res.json({ products });
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id).populate("seller", "name role");
  if (!product) return res.status(404).json({ message: "Product not found." });
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

  const product = await Product.create({
    name, category, price, stock: stock || 0, description,
    imageUrl: finalImage,
    seller: req.user._id,
  });
  res.status(201).json({ product });
}

// PATCH /api/products/:id  (admin who owns it, or superadmin)
async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const isOwner = product.seller.toString() === req.user._id.toString();
  if (req.user.role !== "superadmin" && !isOwner) {
    return res.status(403).json({ message: "You can only edit your own products." });
  }

  const fields = ["name", "category", "price", "stock", "description"];
  fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
  if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;
  else if (req.body.imageUrl) product.imageUrl = req.body.imageUrl;

  await product.save();
  res.json({ product });
}

// DELETE /api/products/:id  (admin who owns it, or superadmin)
async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const isOwner = product.seller.toString() === req.user._id.toString();
  if (req.user.role !== "superadmin" && !isOwner) {
    return res.status(403).json({ message: "You can only delete your own products." });
  }

  await product.deleteOne();
  res.json({ message: "Product deleted." });
}

// GET /api/products/mine  (admin, superadmin) - the logged-in seller's
// own listings. Admins must never see this route return other sellers'
// products; that's enforced by filtering on req.user._id here.
async function listMine(req, res) {
  const products = await Product.find({ seller: req.user._id }).populate("seller", "name role").sort({ createdAt: -1 });
  res.json({ products });
}

module.exports = { listProducts, listMine, getProduct, createProduct, updateProduct, deleteProduct };

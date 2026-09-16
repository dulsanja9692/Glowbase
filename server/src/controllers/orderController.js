const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders  (user) - creates an order from cart items after "payment"
// { items: [{ productId, quantity }], shippingAddress, paymentReference }
async function createOrder(req, res) {
  const { items, shippingAddress, paymentReference } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: "Cart is empty." });

  const resolvedItems = [];
  let total = 0;

  for (const line of items) {
    const product = await Product.findById(line.productId);
    if (!product) return res.status(404).json({ message: `Product ${line.productId} not found.` });
    if (product.stock < line.quantity) {
      return res.status(400).json({ message: `${product.name} only has ${product.stock} in stock.` });
    }
    resolvedItems.push({ product: product._id, name: product.name, price: product.price, quantity: line.quantity });
    total += product.price * line.quantity;
    product.stock -= line.quantity;
    await product.save();
  }

  const order = await Order.create({
    customer: req.user._id,
    items: resolvedItems,
    total,
    shippingAddress,
    payment: { method: "mock-card", status: "paid", reference: paymentReference || `MOCK-${Date.now()}` },
  });

  res.status(201).json({ order });
}

// GET /api/orders/mine  (user) - the logged-in customer's own orders
async function myOrders(req, res) {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
}

// GET /api/orders  (admin, superadmin) - all orders for management
async function listOrders(req, res) {
  const orders = await Order.find().populate("customer", "name email").sort({ createdAt: -1 });
  res.json({ orders });
}

// PATCH /api/orders/:id/status  (admin, superadmin)
async function updateStatus(req, res) {
  const { status } = req.body;
  const allowed = ["Processing", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status." });

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json({ order });
}

module.exports = { createOrder, myOrders, listOrders, updateStatus };

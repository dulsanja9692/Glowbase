const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

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
    const pid = product.id || product._id;
    resolvedItems.push({ product: pid, _id: pid, name: product.name, price: product.price, quantity: line.quantity });
    total += product.price * line.quantity;
    // Decrement stock
    await Product.updateById(pid, { stock: product.stock - line.quantity });
  }

  const userId = req.user.id || req.user._id;
  const order = await Order.createOrder({
    customer: userId,
    items: resolvedItems,
    total,
    shippingAddress,
    payment: { method: "mock-card", status: "paid", reference: paymentReference || `MOCK-${Date.now()}` },
  });

  res.status(201).json({ order });
}

// GET /api/orders/mine  (user) - the logged-in customer's own orders
async function myOrders(req, res) {
  const userId = req.user.id || req.user._id;
  const orders = await Order.findByCustomer(userId);
  res.json({ orders });
}

// GET /api/orders  (admin, superadmin) - all orders for management
async function listOrders(req, res) {
  const orders = await Order.findAll();

  // Populate customer info
  const customerIds = [...new Set(orders.map((o) => o.customer))];
  const customerMap = {};
  for (const cid of customerIds) {
    const customer = await User.findById(cid);
    if (customer) customerMap[cid] = { _id: customer.id, id: customer.id, name: customer.name, email: customer.email };
  }
  const populated = orders.map((o) => ({
    ...o,
    customer: customerMap[o.customer] || o.customer,
  }));

  res.json({ orders: populated });
}

// PATCH /api/orders/:id/status  (admin, superadmin)
async function updateStatus(req, res) {
  const { status } = req.body;
  const allowed = ["Processing", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status." });

  const order = await Order.updateStatus(req.params.id, status);
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json({ order });
}

module.exports = { createOrder, myOrders, listOrders, updateStatus };
